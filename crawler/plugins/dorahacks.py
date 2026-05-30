import httpx
import logging
from datetime import datetime, timezone

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

DORA_API = "https://dorahacks.io/api/hackathon/"
DORA_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://dorahacks.io/hackathon",
}


class DorahacksPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "dorahacks"

    async def fetch(self) -> list[HackathonItem]:
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers=DORA_HEADERS,
            timeout=REQUEST_TIMEOUT,
        ) as client:
            page = 1
            while True:
                try:
                    resp = await client.get(
                        DORA_API,
                        params={"page": page, "page_size": 24, "status": "ongoing"},
                    )
                    if resp.status_code != 200:
                        logger.warning(f"DoraHacks page {page} returned {resp.status_code}")
                        break
                    data = resp.json()
                    results = data.get("results", [])
                    if not results:
                        break

                    logger.info(f"DoraHacks page {page}: {len(results)} items (total: {data.get('count', '?')})")

                    for h in results:
                        try:
                            item = self._parse(h)
                            if item:
                                items.append(item)
                        except Exception as e:
                            logger.error(f"DoraHacks parse error: {e}")

                    # Check if there's a next page
                    if data.get("next") is None:
                        break
                    page += 1
                except Exception as e:
                    logger.warning(f"DoraHacks page {page} error: {e}")
                    break

            # Filter to only cash prize hackathons
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(f"DoraHacks: {dropped}/{all_count} filtered out (no cash prize)")

        return items

    def _parse(self, h: dict) -> HackathonItem | None:
        title = (h.get("title") or "").strip()
        uname = (h.get("uname") or "").strip()

        if not title or not uname:
            return None

        url = f"https://dorahacks.io/hackathon/{uname}"

        # Parse timestamps
        start_ts = h.get("start_time")
        end_ts = h.get("end_time")
        start_date = datetime.fromtimestamp(start_ts, tz=timezone.utc) if start_ts else datetime.now(timezone.utc)
        end_date = datetime.fromtimestamp(end_ts, tz=timezone.utc) if end_ts else datetime.now(timezone.utc)

        # Prize: bonus_price is the total prize in USD
        bonus = h.get("bonus_price") or 0
        prize_pool = f"${bonus:,}" if bonus else None

        # Themes from ecosystem
        ecosystem = h.get("ecosystem") or ""
        themes = [t.strip() for t in ecosystem.split(",") if t.strip()]

        # Build description from description + tab_set content
        desc_parts: list[str] = []
        desc_text = h.get("description")
        if desc_text:
            desc_parts.append(desc_text.strip())

        for tab in h.get("tab_set") or []:
            tab_name = tab.get("name", "")
            tab_desc = tab.get("description", "")
            if tab_desc:
                desc_parts.append(f"{tab_name}\n{tab_desc.strip()}")

        description = "\n\n".join(desc_parts) if desc_parts else None

        return HackathonItem(
            source_id=f"dorahacks_{h['id']}",
            source="dorahacks",
            title=title,
            description=description,
            url=url,
            image_url=h.get("image_url"),
            start_date=start_date,
            end_date=end_date,
            prize_pool=prize_pool,
            themes=themes,
        )

    @staticmethod
    def _has_cash_prize(prize_pool: str | None) -> bool:
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
