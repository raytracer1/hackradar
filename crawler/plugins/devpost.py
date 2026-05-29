import httpx
import logging
from datetime import datetime

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
            try:
                resp = await client.get(
                    "https://devpost.com/api/hackathons",
                    params={"status": "upcoming"},
                )
                resp.raise_for_status()
                data = resp.json()
                hackathons = data.get("hackathons", [])
            except Exception as e:
                logger.warning(f"Devpost API failed, trying HTML fallback: {e}")
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

    def _parse(self, h: dict) -> HackathonItem | None:
        title = h.get("title", "").strip()
        url = h.get("url", "")
        source_id = h.get("id", "")

        if not title or not url:
            return None

        if not source_id:
            source_id = url.rstrip("/").split("/")[-1]

        # Parse dates
        start_str = h.get("submission_period_dates", h.get("start_date", ""))
        end_str = h.get("submission_period_dates", h.get("end_date", ""))

        # Parse themes
        themes_raw = h.get("themes", h.get("tags", []))
        if isinstance(themes_raw, str):
            themes = [t.strip() for t in themes_raw.split(",") if t.strip()]
        else:
            themes = themes_raw if isinstance(themes_raw, list) else []

        return HackathonItem(
            source_id=f"devpost_{source_id}",
            source="devpost",
            title=title,
            description=h.get("description", h.get("excerpt", "")),
            url=url,
            image_url=h.get("thumbnail_url", h.get("image_url")),
            mode=self._guess_mode(h),
            location=h.get("location"),
            start_date=datetime.now(),
            end_date=datetime.now(),
            prize_pool=h.get("prize_amount"),
            themes=themes,
        )

    def _guess_mode(self, h: dict) -> str:
        loc = (h.get("location") or "").lower()
        if not loc:
            return "online"
        if "online" in loc:
            return "hybrid" if h.get("location") else "online"
        return "offline"
