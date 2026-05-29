import httpx
import logging
from datetime import datetime
from bs4 import BeautifulSoup

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class UnstopPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "unstop"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape Unstop hackathons from their public page."""
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                resp = await client.get("https://unstop.com/hackathons")
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")

                for card in soup.select("a[href*='hackathon/'], .competition-card, [class*='listing'] a"):
                    try:
                        item = self._parse_card(card)
                        if item:
                            items.append(item)
                    except Exception as e:
                        logger.error(f"Unstop card parse error: {e}")

            except Exception as e:
                logger.error(f"Unstop scrape failed: {e}")

        return items

    def _parse_card(self, card) -> HackathonItem | None:
        href = card.get("href", "") if card.name == "a" else ""
        if not href:
            link_el = card.select_one("a")
            if link_el:
                href = link_el.get("href", "")

        if not href or "/hackathon/" not in href:
            return None

        if href and not href.startswith("http"):
            href = f"https://unstop.com{href}"

        title_el = card.select_one("h2, h3, [class*='title'], [class*='name']")
        title = title_el.get_text(strip=True) if title_el else href.split("/")[-1].replace("-", " ").title()

        source_id = href.rstrip("/").split("/")[-1] if href else title.replace(" ", "-").lower()

        return HackathonItem(
            source_id=f"unstop_{source_id}",
            source="unstop",
            title=title,
            url=href,
            image_url=None,
            mode="online",
            location=None,
            start_date=datetime.now(),
            end_date=datetime.now(),
            prize_pool=None,
            themes=[],
        )
