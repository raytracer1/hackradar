import logging
from datetime import datetime, timezone

import httpx

from plugins.base import BasePlugin
from models import HackathonItem
from config import REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

SINCEAI_API = "https://sinceai.app/api/hackathons"
SINCEAI_EVENT_URL = "https://sinceai.app/events/{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class SinceaiPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "sinceai"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape AI hackathons from sinceai.app public API."""
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": BROWSER_UA},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                resp = await client.get(SINCEAI_API)
                if resp.status_code != 200:
                    logger.error(
                        f"SinceAI API returned {resp.status_code}"
                    )
                    return []
                hackathons = resp.json()
            except Exception as e:
                logger.error(f"SinceAI fetch failed: {e}")
                return []

            logger.info(f"SinceAI: {len(hackathons)} hackathons found")

            now = datetime.now(timezone.utc)
            for ev in hackathons:
                try:
                    # Skip ended events
                    status = (ev.get("status") or "").upper()
                    if status == "ENDED":
                        continue

                    item = self._parse(ev)
                    if item is None:
                        continue
                    if item.end_date < now:
                        continue
                    items.append(item)
                except Exception as e:
                    logger.error(f"SinceAI parse error: {e}")

            # Filter to only cash-prize hackathons
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(
                    f"SinceAI: {dropped}/{all_count} filtered out (no cash prize)"
                )

        return items

    def _parse(self, ev: dict) -> HackathonItem | None:
        """Parse a SinceAI hackathon dict into a HackathonItem."""
        title = (ev.get("title") or "").strip()
        slug = (ev.get("slug") or "").strip()

        if not title or not slug:
            return None

        url = SINCEAI_EVENT_URL.format(slug)
        description = (ev.get("description") or "").strip() or None

        # Parse dates
        start_str = ev.get("startDate", "")
        end_str = ev.get("endDate", "")

        try:
            start_date = datetime.fromisoformat(
                start_str.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            start_date = datetime.now(timezone.utc)

        try:
            end_date = datetime.fromisoformat(
                end_str.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            end_date = start_date

        # Prize pool
        prize_pool = None
        prize_amount = ev.get("prizePool")
        if prize_amount and isinstance(prize_amount, (int, float)) and prize_amount > 0:
            prize_pool = f"USD {int(prize_amount):,}"

        # Location
        location = (ev.get("location") or "").strip()

        # Tags as themes
        tags = ev.get("tags") or []
        themes = [t.strip() for t in tags if t.strip()]

        return HackathonItem(
            source_id=f"sinceai_{ev.get('id', slug)}",
            source="sinceai",
            title=title,
            description=description,
            url=url,
            image_url=None,
            start_date=start_date,
            end_date=end_date,
            timezone="Europe/Helsinki",  # Since AI is based in Turku, Finland
            prize_pool=prize_pool,
            themes=themes,
        )

    @staticmethod
    def _has_cash_prize(prize_pool: str | None) -> bool:
        """Return True if prize_pool indicates a non-zero cash prize."""
        if not prize_pool:
            return False
        import re
        cleaned = re.sub(r"[^\d.]", "", prize_pool.replace(",", ""))
        m = re.search(r"[\d.]+", cleaned)
        if not m:
            return False
        try:
            return float(m.group()) > 0
        except ValueError:
            return False
