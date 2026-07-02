import json
import logging
import re
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup

from plugins.base import BasePlugin
from models import HackathonItem
from config import REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

ZEROG_ARENA_URL = "https://0g.ai/arena"
ZEROG_EVENT_URL = "https://0g.ai/arena/{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class ZerogPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "0garena"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape 0g.ai/arena hackathons.

        Discovers event URLs from the listing page RSC payload, then
        scrapes each detail page for structured data (JSON-LD, meta tags,
        visible markup).
        """
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": BROWSER_UA},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            # Step 1 — discover event slugs
            try:
                resp = await client.get(ZEROG_ARENA_URL)
                if resp.status_code != 200:
                    logger.error(f"0G Arena returned {resp.status_code}")
                    return []
                html = resp.text
            except Exception as e:
                logger.error(f"0G Arena fetch failed: {e}")
                return []

            slugs = self._discover_slugs(html)
            logger.info(f"0G Arena: {len(slugs)} event(s) discovered")

            # Step 2 — scrape each detail page
            now = datetime.now(timezone.utc)
            for slug in slugs:
                try:
                    url = ZEROG_EVENT_URL.format(slug)
                    detail = await self._scrape_detail(client, url)
                    if not detail:
                        continue
                    item = self._build_item(detail, slug)
                    if item is None:
                        continue
                    if item.end_date < now:
                        continue
                    items.append(item)
                except Exception as e:
                    logger.error(f"0G Arena error for {slug}: {e}")

            logger.info(f"0G Arena: {len(items)} hackathon(s) kept")

        return items

    # ---- discovery ----

    def _discover_slugs(self, html: str) -> list[str]:
        """Find event slugs from the listing page RSC."""
        combined = self._decode_rsc(html)
        slugs: list[str] = []
        for m in re.finditer(
            r'"className":"event-card","href":"/([^"]+)"', combined
        ):
            slug = m.group(1).strip("/")
            if slug and slug not in slugs:
                slugs.append(slug)
        return slugs

    # ---- detail scraping ----

    async def _scrape_detail(
        self, client: httpx.AsyncClient, url: str
    ) -> dict | None:
        """Scrape a 0G event page using JSON-LD + visible markup."""
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.warning(f"0G detail returned {resp.status_code}: {url}")
                return None
            html = resp.text
        except Exception as e:
            logger.warning(f"0G detail fetch failed for {url}: {e}")
            return None

        soup = BeautifulSoup(html, "lxml")
        result: dict = {}

        # JSON-LD structured data (dates, name, status)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                ld = json.loads(script.string or "")
                if isinstance(ld, dict) and ld.get("@type") == "Event":
                    result["title"] = ld.get("name", "").strip()
                    result["start_date"] = self._parse_iso(
                        ld.get("startDate")
                    )
                    result["end_date"] = self._parse_iso(ld.get("endDate"))
                    result["description"] = ld.get("description", "").strip() or None
                    break
            except (json.JSONDecodeError, TypeError):
                pass

        # Meta description fallback
        if not result.get("description"):
            meta = soup.find("meta", attrs={"name": "description"})
            if meta and meta.get("content"):
                result["description"] = meta["content"].strip()

        # Title fallback from <title>
        if not result.get("title"):
            title_tag = soup.find("title")
            if title_tag:
                t = title_tag.get_text(strip=True)
                t = re.sub(r"\s*[·|]\s*Arena\s*$", "", t).strip()
                result["title"] = t

        # Prize pool from visible markup
        prize_el = soup.find("span", string=re.compile(r"Prize\s*pool", re.I))
        if prize_el:
            b = prize_el.find_next("b")
            if b:
                result["prize_pool"] = b.get_text(strip=True)

        # About / longer description from hero or intro section
        for sel in ['[class*="hero"] p', '[class*="intro"]', '[class*="about"]']:
            el = soup.select_one(sel)
            if el:
                text = el.get_text(" ", strip=True)
                if text and len(text) > 50:
                    result["about"] = text
                    break

        return result if result else None

    def _build_item(self, detail: dict, slug: str) -> HackathonItem | None:
        """Build HackathonItem from detail dict."""
        title = detail.get("title", "").strip()
        if not title:
            return None

        return HackathonItem(
            source_id=f"0garena_{slug}",
            source="0garena",
            title=title,
            description=detail.get("description"),
            about=detail.get("about"),
            url=ZEROG_EVENT_URL.format(slug),
            image_url=detail.get("image_url"),
            start_date=detail.get("start_date") or datetime.now(timezone.utc),
            end_date=detail.get("end_date") or datetime.now(timezone.utc),
            timezone="UTC",
            prize_pool=detail.get("prize_pool"),
            themes=["AI", "DeFi", "Web3"],
        )

    # ---- helpers ----

    @staticmethod
    def _decode_rsc(html: str) -> str:
        chunks = re.findall(
            r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)',
            html,
            re.DOTALL,
        )
        decoded = []
        for chunk in chunks:
            try:
                decoded.append(json.loads('"' + chunk + '"'))
            except json.JSONDecodeError:
                pass
        return "".join(decoded)

    @staticmethod
    def _parse_iso(date_str: str | None) -> datetime | None:
        if not date_str:
            return None
        try:
            # Handle date-only strings like "2026-06-15"
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except (ValueError, TypeError):
            return None
