import httpx
import logging
from datetime import datetime
from bs4 import BeautifulSoup

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class DevfolioPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "devfolio"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape Devfolio hackathons from their public page."""
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                resp = await client.get("https://devfolio.co/hackathons")
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")

                for card in soup.select("a[href*='hackathons/'], .hackathon-card, [class*='HackathonCard']"):
                    try:
                        item = self._parse_card(card)
                        if item:
                            items.append(item)
                    except Exception as e:
                        logger.error(f"Devfolio card parse error: {e}")

            except Exception as e:
                logger.error(f"Devfolio scrape failed: {e}")

        return items

    def _parse_card(self, card) -> HackathonItem | None:
        # Get link
        href = card.get("href", "") if card.name == "a" else ""
        if not href:
            link_el = card.select_one("a[href*='hackathon']")
            if link_el:
                href = link_el.get("href", "")

        if not href:
            return None

        if href and not href.startswith("http"):
            href = f"https://devfolio.co{href}"

        # Title
        title_el = card.select_one("h2, h3, [class*='title'], [class*='name']")
        title = title_el.get_text(strip=True) if title_el else href.split("/")[-1].replace("-", " ").title()

        source_id = href.rstrip("/").split("/")[-1] if href else title.replace(" ", "-").lower()

        return HackathonItem(
            source_id=f"devfolio_{source_id}",
            source="devfolio",
            title=title,
            url=href,
            image_url=None,
            start_date=datetime.now(),
            end_date=datetime.now(),
            prize_pool=None,
            themes=[],
        )
