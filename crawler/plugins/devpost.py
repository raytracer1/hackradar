import httpx
import logging
from datetime import datetime, timezone, timedelta

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class DevpostPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "devpost"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape Devpost hackathons from their public API."""
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            hackathons: list[dict] = []
            page = 1
            while True:
                try:
                    resp = await client.get(
                        "https://devpost.com/api/hackathons",
                        params={"status": "open", "page": page, "per_page": 100},
                    )
                    if resp.status_code != 200:
                        break
                    data = resp.json()
                    meta = data.get("meta", {})
                    total = meta.get("total_count", "?")
                    page_items = data.get("hackathons", [])
                    if not page_items:
                        break
                    hackathons.extend(page_items)
                    logger.info(f"Devpost page {page}: {len(page_items)} items (total: {total}, collected: {len(hackathons)})")
                    if not page_items or len(hackathons) >= total:
                        break
                    page += 1
                except Exception as e:
                    logger.warning(f"Devpost page {page} error: {e}")
                    break

            if not hackathons:
                logger.warning("Devpost API returned no results, trying HTML fallback")
                hackathons = await self._scrape_html(client)

            for h in hackathons:
                try:
                    item = self._parse(h if isinstance(h, dict) else {})
                    if item:
                        items.append(item)
                except Exception as e:
                    logger.error(f"Devpost parse error: {e}")

        return items

    async def _scrape_html(self, client: httpx.AsyncClient) -> list[dict]:
        """Fallback: scrape Devpost hackathons listing page."""
        try:
            from bs4 import BeautifulSoup

            resp = await client.get("https://devpost.com/hackathons?status=upcoming")
            soup = BeautifulSoup(resp.text, "lxml")
            results: list[dict] = []

            for card in soup.select(".hackathon-tile, .challenge-listing article"):
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
                })

            return results
        except Exception as e:
            logger.error(f"Devpost HTML fallback failed: {e}")
            return []

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
        from datetime import timedelta
        text = text.lower().strip()
        # "about 2 hours left" → timedelta(hours=2)
        m = re.match(r'(?:about\s+)?(\d+)\s+(minute|hour|day|week|month)s?\s+left', text)
        if m:
            num = int(m.group(1))
            unit = m.group(2)
            now = datetime.now(timezone.utc)
            if unit == 'minute':
                return now + timedelta(minutes=num)
            elif unit == 'hour':
                return now + timedelta(hours=num)
            elif unit == 'day':
                return now + timedelta(days=num)
            elif unit == 'week':
                return now + timedelta(weeks=num)
            elif unit == 'month':
                return now + timedelta(days=num * 30)
        # "a few hours left" / "less than an hour left"
        if 'hour' in text:
            return datetime.now(timezone.utc) + timedelta(hours=1)
        if 'minute' in text or 'less than' in text:
            return datetime.utcnow() + timedelta(minutes=30)
        return None

    @staticmethod
    def _parse_period(period: str) -> tuple[datetime | None, datetime | None]:
        """Parse Devpost submission_period_dates like 'Jun 1 – Aug 31, 2026'."""
        if not period:
            return None, None
        try:
            import re
            parts = [p.strip() for p in re.split(r'\s[–\-—]\s', period, 1)]
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
                # "31, 2026" or "29, 2026" → need month from start
                try:
                    end = parse(f"{start.strftime('%b')} {end_str}").replace(tzinfo=timezone.utc)
                except Exception:
                    try:
                        end = parse(f"{end_str}, {start.year}").replace(tzinfo=timezone.utc)
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

        start_date, end_date = self._parse_period(h.get("submission_period_dates", ""))
        precise_end = self._parse_time_left(h.get("time_left_to_submission", ""))
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

        # Extract location string from API response
        loc_raw = h.get("displayed_location")
        if isinstance(loc_raw, dict):
            loc_str = loc_raw.get("name", "") if loc_raw else ""
        else:
            loc_str = str(loc_raw or "")

        return HackathonItem(
            source_id=f"devpost_{source_id}",
            source="devpost",
            title=title,
            description=self._strip_html(h.get("description", "")),
            url=url,
            image_url=h.get("thumbnail_url"),
            mode=self._guess_mode(loc_str),
            location=loc_str or None,
            start_date=start_date or datetime.now(timezone.utc),
            end_date=end_date or start_date or datetime.now(timezone.utc),
            prize_pool=self._strip_html(h.get("prize_amount")),
            themes=themes,
        )

    @staticmethod
    def _guess_mode(loc_str: str) -> str:
        loc = loc_str.lower()
        if not loc or "online" in loc:
            return "online"
        return "offline"
