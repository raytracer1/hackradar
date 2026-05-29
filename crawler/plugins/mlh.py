import httpx
import logging
from datetime import datetime

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class MLHPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "mlh"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape MLH hackathons from their public event API."""
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                # MLH public events endpoint
                resp = await client.get("https://mlh.io/seed/v2/events", follow_redirects=True)
                resp.raise_for_status()
                data = resp.json()
                events = data.get("events", [])
            except Exception as e:
                logger.warning(f"MLH API failed: {e}")
                return items

            for ev in events:
                try:
                    item = self._parse(ev)
                    if item:
                        items.append(item)
                except Exception as e:
                    logger.error(f"MLH parse error: {e}")

        return items

    def _parse(self, ev: dict) -> HackathonItem | None:
        title = ev.get("name", "").strip()
        ev_id = ev.get("id", "")
        if not title or not ev_id:
            return None

        # Parse mode
        mode_map = {
            "online": "online",
            "in-person": "offline",
            "hybrid": "hybrid",
        }
        mode_raw = (ev.get("format", "") or "").lower()
        mode = mode_map.get(mode_raw, "online")

        # Parse dates
        start_date = datetime.fromisoformat(ev["start_date"].replace("Z", "+00:00")) if ev.get("start_date") else datetime.now()
        end_date = datetime.fromisoformat(ev["end_date"].replace("Z", "+00:00")) if ev.get("end_date") else datetime.now()

        return HackathonItem(
            source_id=f"mlh_{ev_id}",
            source="mlh",
            title=title,
            description=ev.get("description"),
            url=ev.get("website_url", ev.get("registration_url", "")),
            image_url=ev.get("logo_url", ev.get("banner_url")),
            mode=mode,
            location=ev.get("location", ev.get("city")),
            start_date=start_date,
            end_date=end_date,
            prize_pool=None,
            themes=[],
        )
