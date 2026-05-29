import httpx
import logging
from datetime import datetime
from bs4 import BeautifulSoup

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class HackerEarthPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "hackerearth"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape HackerEarth hackathons/challenges listing page."""
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                resp = await client.get(
                    "https://www.hackerearth.com/challenges/hackathon/"
                )
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")

                for card in soup.select(".challenge-card, .upcoming-challenge, .challenge-card-modern"):
                    try:
                        item = self._parse_card(card)
                        if item:
                            items.append(item)
                    except Exception as e:
                        logger.error(f"HackerEarth card parse error: {e}")

            except Exception as e:
                logger.error(f"HackerEarth scrape failed: {e}")

        return items

    def _parse_card(self, card) -> HackathonItem | None:
        title_el = card.select_one("h2, h3, .challenge-name, .challenge-list-title")
        link_el = card.select_one("a[href*='challenge']")

        if not title_el or not link_el:
            return None

        title = title_el.get_text(strip=True)
        href = link_el.get("href", "")
        if href and not href.startswith("http"):
            href = f"https://www.hackerearth.com{href}"

        source_id = href.rstrip("/").split("/")[-1] if href else title.replace(" ", "-").lower()

        # Try to find mode
        text = card.get_text().lower()
        if "offline" in text:
            mode = "offline"
        elif "online" in text:
            mode = "online"
        else:
            mode = "online"

        # Try to find date
        date_el = card.select_one(".date, .challenge-date, time")
        date_text = date_el.get_text(strip=True) if date_el else ""

        # Try to find prize
        prize_el = card.select_one(".prize, .prize-pool, .reward")
        prize_pool = prize_el.get_text(strip=True) if prize_el else None

        return HackathonItem(
            source_id=f"hackerearth_{source_id}",
            source="hackerearth",
            title=title,
            url=href,
            image_url=None,
            mode=mode,
            location=None,
            start_date=datetime.now(),
            end_date=datetime.now(),
            prize_pool=prize_pool,
            themes=[],
        )
