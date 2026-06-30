import asyncio
import httpx
import logging
from datetime import datetime, timezone, timedelta

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

MAX_CONCURRENT = 5

# Realistic browser UA to avoid bot detection — the original HackRadarBot UA gets blocked
BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class DevpostPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "devpost"

    async def _get_waf_cookies(self) -> dict[str, str]:
        """Launch headless browser to pass AWS WAF JS challenge, return cookies."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=BROWSER_UA)
            page = await context.new_page()

            try:
                # Navigate to the API endpoint — browser auto-solves WAF challenge
                url = (
                    "https://devpost.com/api/hackathons"
                    "?status[]=upcoming&status[]=open&order_by=deadline&page=1&per_page=1"
                )
                resp = await page.goto(url, wait_until="networkidle", timeout=30000)

                if resp and resp.status == 200:
                    logger.info("Successfully passed WAF challenge via Playwright")
                elif resp:
                    logger.warning(
                        f"Playwright WAF pass returned status {resp.status}"
                    )

                cookies = await context.cookies()
                await page.close()
                await browser.close()
                return {c["name"]: c["value"] for c in cookies}

            except Exception as e:
                logger.error(f"Failed to pass WAF challenge: {e}")
                await browser.close()
                return {}

    async def fetch(self) -> list[HackathonItem]:
        """Scrape Devpost hackathons from their public API.

        Uses Playwright to pass AWS WAF JS challenge, then httpx for speed.
        """
        items: list[HackathonItem] = []

        # Step 1 — get valid cookies by passing the WAF JS challenge
        waf_cookies = await self._get_waf_cookies()
        if not waf_cookies:
            logger.error("Devpost: could not obtain WAF cookies, aborting")
            return []

        async with httpx.AsyncClient(
            headers={"User-Agent": BROWSER_UA},
            cookies=waf_cookies,
            timeout=REQUEST_TIMEOUT,
        ) as client:
            hackathons: list[dict] = []
            page = 1
            while True:
                try:
                    resp = await client.get(
                        "https://devpost.com/api/hackathons",
                        params={
                            "status": ["upcoming", "open"],
                            "order_by": "deadline",
                            "page": page,
                            "per_page": 100,
                        },
                    )
                    if resp.status_code != 200:
                        logger.warning(
                            f"Devpost API returned {resp.status_code} on page {page}"
                        )
                        break
                    data = resp.json()
                    meta = data.get("meta", {})
                    total = meta.get("total_count", 0)
                    page_items = data.get("hackathons", [])
                    if not page_items:
                        break
                    hackathons.extend(page_items)
                    logger.info(
                        f"Devpost page {page}: {len(page_items)} items "
                        f"(total: {total}, collected: {len(hackathons)})"
                    )
                    # Guard: stop when we've collected everything
                    if isinstance(total, int) and len(hackathons) >= total:
                        break
                    page += 1
                except Exception as e:
                    logger.warning(f"Devpost page {page} error: {e}")
                    break

            if not hackathons:
                logger.warning(
                    "Devpost API returned no results, trying HTML fallback"
                )
                hackathons = await self._scrape_html(client)

            for h in hackathons:
                try:
                    item = self._parse(h if isinstance(h, dict) else {})
                    if item:
                        items.append(item)
                except Exception as e:
                    logger.error(f"Devpost parse error: {e}")

            # Filter out hackathons without cash prizes before scraping details
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(
                    f"Devpost: {dropped}/{all_count} filtered out (no cash prize)"
                )

            if items:
                logger.info(
                    f"Scraping detail pages for {len(items)} hackathons..."
                )
                await self._scrape_all_details(client, items)

        return items

    async def _scrape_html(self, client: httpx.AsyncClient) -> list[dict]:
        """Fallback: scrape Devpost hackathons listing page."""
        try:
            resp = await client.get(
                "https://devpost.com/hackathons?status=upcoming"
            )
            soup = BeautifulSoup(resp.text, "lxml")
            results: list[dict] = []

            for card in soup.select(
                ".hackathon-tile, .challenge-listing article"
            ):
                title_el = card.select_one("h2, h3, .title")
                link_el = card.select_one("a[href]")
                if not title_el or not link_el:
                    continue

                href = link_el.get("href", "")
                if href and not href.startswith("http"):
                    href = f"https://devpost.com{href}"

                results.append({
                    "title": title_el.get_text(strip=True),
                    "url": href,
                    "id": href.split("/")[-1] if href else "",
                    # Without prize_amount the cash-prize filter drops everything
                    "prize_amount": "$0",
                })

            return results
        except Exception as e:
            logger.error(f"Devpost HTML fallback failed: {e}")
            return []

    def _extract_sections(self, article) -> dict[str, str]:
        """Extract sections from headings inside an article element.
        Matches: about -> about, build -> whatToBuild,
                 submit -> whatToSubmit, prize -> prizesDetail.
        """
        result: dict = {}
        for heading in article.find_all(["h2", "h3", "h4"]):
            text = heading.get_text(strip=True).lower()
            key = None
            if "about" in text:
                key = "about"
            elif "build" in text:
                key = "whatToBuild"
            elif "submit" in text:
                key = "whatToSubmit"
            elif "prize" in text:
                key = "prizesDetail"
            if not key:
                continue

            parts: list[str] = []
            el = heading.find_next_sibling()
            while el and el.name not in ("h2", "h3", "h4"):
                t = el.get_text(strip=True)
                if t:
                    parts.append(t)
                el = el.find_next_sibling()
            if parts:
                result[key] = " ".join(parts)

        return result

    async def _scrape_detail(
        self, client: httpx.AsyncClient, url: str
    ) -> dict | None:
        """Scrape hackathon detail page for
        about / whatToBuild / whatToSubmit / prizesDetail.
        """
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.warning(
                    f"Detail page returned {resp.status_code}: {url}"
                )
                return None
            soup = BeautifulSoup(resp.text, "lxml")

            desc_article = soup.find("article", id="challenge-description")
            prizes_article = soup.find("article", id="prizes")

            if not desc_article and not prizes_article:
                return None

            result: dict = {}
            if desc_article:
                result.update(self._extract_sections(desc_article))
                if not result:
                    text = desc_article.get_text(" ", strip=True)
                    if text:
                        result["about"] = text
            if prizes_article:
                text = prizes_article.get_text(" ", strip=True)
                if text:
                    result["prizesDetail"] = text

            # For still-missing keys, fall back to whole-page search
            fallback = self._extract_sections(soup)
            for key in ("about", "whatToBuild", "whatToSubmit", "prizesDetail"):
                if key not in result and key in fallback:
                    result[key] = fallback[key]

            return result if result else None
        except Exception as e:
            logger.warning(f"Detail scraping failed for {url}: {e}")
            return None

    async def _scrape_all_details(
        self, client: httpx.AsyncClient, items: list[HackathonItem]
    ) -> None:
        """Concurrently scrape detail pages."""
        sem = asyncio.Semaphore(MAX_CONCURRENT)

        async def scrape_one(item: HackathonItem):
            async with sem:
                data = await self._scrape_detail(client, item.url)
                if data:
                    item.about = data.get("about")
                    item.what_to_build = data.get("whatToBuild")
                    item.what_to_submit = data.get("whatToSubmit")
                    item.prizes_detail = data.get("prizesDetail")
                    logger.debug(
                        f"Detail scraped: {item.title} ({len(data)} sections)"
                    )

        await asyncio.gather(*[scrape_one(item) for item in items])

    @staticmethod
    def _has_cash_prize(prize_pool: str | None) -> bool:
        """Return True if prize_pool indicates a non-zero cash prize."""
        if not prize_pool:
            return False
        import re

        cleaned = prize_pool.replace(",", "").replace("$", "")
        m = re.search(r"[\d.]+", cleaned)
        if not m:
            return False
        try:
            return float(m.group()) > 0
        except ValueError:
            return False

    @staticmethod
    def _strip_html(text: str | None) -> str | None:
        import re

        if not text:
            return text
        return re.sub(r"<[^>]+>", "", text).strip()

    @staticmethod
    def _parse_time_left(text: str) -> datetime | None:
        """Parse 'about 2 hours left' or '13 days left' into precise datetime."""
        if not text:
            return None
        import re

        text = text.lower().strip()
        m = re.match(
            r"(?:about\s+)?(\d+)\s+(minute|hour|day|week|month)s?\s+left",
            text,
        )
        if m:
            num = int(m.group(1))
            unit = m.group(2)
            now = datetime.now(timezone.utc)
            if unit == "minute":
                return now + timedelta(minutes=num)
            elif unit == "hour":
                return now + timedelta(hours=num)
            elif unit == "day":
                return now + timedelta(days=num)
            elif unit == "week":
                return now + timedelta(weeks=num)
            elif unit == "month":
                return now + timedelta(days=num * 30)
        # "a few hours left" / "less than an hour left"
        if "hour" in text:
            return datetime.now(timezone.utc) + timedelta(hours=1)
        if "minute" in text or "less than" in text:
            return datetime.now(timezone.utc) + timedelta(minutes=30)
        return None

    @staticmethod
    def _parse_period(period: str) -> tuple[datetime | None, datetime | None]:
        """Parse Devpost submission_period_dates like 'Jun 1 – Aug 31, 2026'."""
        if not period:
            return None, None
        try:
            import re

            parts = [
                p.strip() for p in re.split(r"\s[–\-—]\s", period, 1)
            ]
            if len(parts) != 2:
                from dateutil.parser import parse

                dt = parse(period).replace(tzinfo=timezone.utc)
                return dt, dt

            start_str = parts[0]
            end_str = parts[1]
            from dateutil.parser import parse

            start = parse(start_str).replace(tzinfo=timezone.utc)
            try:
                end = parse(end_str).replace(tzinfo=timezone.utc)
            except Exception:
                try:
                    end = parse(
                        f"{start.strftime('%b')} {end_str}"
                    ).replace(tzinfo=timezone.utc)
                except Exception:
                    try:
                        end = parse(f"{end_str}, {start.year}").replace(
                            tzinfo=timezone.utc
                        )
                    except Exception:
                        end = start
            return start, end
        except Exception:
            return None, None

    def _parse(self, h: dict) -> HackathonItem | None:
        title = h.get("title", "").strip()
        url = h.get("url", "")
        source_id = h.get("id", "")

        if not title or not url:
            return None

        if not source_id:
            source_id = url.rstrip("/").split("/")[-1]

        start_date, end_date = self._parse_period(
            h.get("submission_period_dates", "")
        )
        precise_end = self._parse_time_left(
            h.get("time_left_to_submission", "")
        )
        if precise_end:
            end_date = precise_end
        themes_raw = h.get("themes", h.get("tags", []))
        themes: list[str] = []
        if isinstance(themes_raw, str):
            themes = [t.strip() for t in themes_raw.split(",") if t.strip()]
        elif isinstance(themes_raw, list):
            for t in themes_raw:
                if isinstance(t, dict):
                    name = t.get("name", "")
                    if name:
                        themes.append(name)
                elif isinstance(t, str):
                    themes.append(t)

        return HackathonItem(
            source_id=f"devpost_{source_id}",
            source="devpost",
            title=title,
            description=self._strip_html(h.get("description", "")),
            url=url,
            image_url=h.get("thumbnail_url"),
            start_date=start_date or datetime.now(timezone.utc),
            end_date=end_date or start_date or datetime.now(timezone.utc),
            prize_pool=self._strip_html(h.get("prize_amount")),
            themes=themes,
        )
