import asyncio
import httpx
import logging
from datetime import datetime, timezone

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

DORA_API = "https://dorahacks.io/api/v1/hub/hackathons"
DORA_MAX_RETRIES = 3
DORA_BACKOFF_BASE = 2  # seconds, doubled per retry (2s → 4s → 8s)
DORA_PAGE_DELAY = 2  # seconds between page requests (API rate-limits rapid calls)
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
            now = datetime.now(timezone.utc)
            page = 1
            while True:
                try:
                    resp = await self._get_page(client, page)
                    if resp is None:
                        logger.warning(f"DoraHacks page {page}: giving up after retries")
                        break
                    data = resp.json()
                    results = data.get("results", [])
                    if not results:
                        break

                    logger.info(f"DoraHacks page {page}: {len(results)} items (total: {data.get('count', '?')})")

                    page_ended = 0
                    for h in results:
                        try:
                            item = self._parse(h)
                            if item is None:
                                continue
                            # Skip ended hackathons
                            if item.end_date < now:
                                page_ended += 1
                                continue
                            items.append(item)
                        except Exception as e:
                            logger.error(f"DoraHacks parse error: {e}")

                    # Stop when fewer results than page_size (last page)
                    if len(results) < 50:
                        break

                    # Early stop: all items on page ended → remaining pages older
                    if page_ended == len(results):
                        logger.info(
                            "DoraHacks: entire page ended, stopping pagination"
                        )
                        break
                    page += 1
                    # Be nice to the API between page requests
                    await asyncio.sleep(DORA_PAGE_DELAY)
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

    async def _get_page(self, client: httpx.AsyncClient, page: int) -> httpx.Response | None:
        """Fetch one page with retries/backoff on rate limits (405/429) and errors."""
        for attempt in range(DORA_MAX_RETRIES + 1):
            try:
                resp = await client.get(
                    DORA_API,
                    params={"page": page, "page_size": 50},
                )
                if resp.status_code == 200:
                    return resp
            except Exception as e:
                if attempt < DORA_MAX_RETRIES:
                    logger.warning(f"DoraHacks page {page} error: {e} (attempt {attempt + 1})")
                else:
                    logger.warning(f"DoraHacks page {page} error: {e}")
                    return None
                await asyncio.sleep(DORA_BACKOFF_BASE * (2 ** attempt))
                continue

            if attempt < DORA_MAX_RETRIES:
                backoff = DORA_BACKOFF_BASE * (2 ** attempt)
                logger.warning(
                    f"DoraHacks page {page} returned {resp.status_code}, "
                    f"retrying in {backoff}s ({attempt + 1}/{DORA_MAX_RETRIES})"
                )
                await asyncio.sleep(backoff)
            else:
                logger.warning(f"DoraHacks page {page} returned {resp.status_code}, giving up")
                return None

    def _parse(self, h: dict) -> HackathonItem | None:
        title = (h.get("title") or "").strip()
        if not title:
            return None

        uname = (h.get("uname") or "").strip()
        if not uname:
            logger.debug(
                "DoraHacks: item id=%s '%s' has no uname, using id-based URL",
                h.get("id"),
                title,
            )
            url = f"https://dorahacks.io/hackathon/{h['id']}/detail"
        else:
            url = f"https://dorahacks.io/hackathon/{uname}"

        # Parse timestamps (new API uses timeline_start / timeline_end)
        start_ts = h.get("timeline_start")
        end_ts = h.get("timeline_end")
        start_date = datetime.fromtimestamp(start_ts, tz=timezone.utc) if start_ts else datetime.now(timezone.utc)
        end_date = datetime.fromtimestamp(end_ts, tz=timezone.utc) if end_ts else datetime.now(timezone.utc)

        # Prize: bonus_price + bonus_token (e.g. "USD 200,000")
        bonus = h.get("bonus_price") or 0
        token = (h.get("bonus_token") or "USD").strip()
        prize_pool = f"{token} {bonus:,}" if bonus else None

        # Themes from ecosystem and tags
        themes: list[str] = []
        ecosystem = h.get("ecosystem") or ""
        for t in ecosystem.split(","):
            t = t.strip()
            if t and t not in themes:
                themes.append(t)
        tags = h.get("tags") or ""
        for t in tags.split(","):
            t = t.strip()
            if t and t not in themes:
                themes.append(t)

        # Venue info
        venue_form = (h.get("venue_form") or "").strip()
        venue_name = (h.get("venue_name") or "").strip()
        venue_parts = [p for p in [venue_form, venue_name] if p]
        location = " | ".join(venue_parts) if venue_parts else None

        # Build description from available fields
        desc_parts: list[str] = []
        if location:
            desc_parts.append(location)
        owner = h.get("owner") or {}
        org_name = (owner.get("name") or "").strip()
        if org_name:
            desc_parts.append(f"Organizer: {org_name}")

        description = "\n".join(desc_parts) if desc_parts else None

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
            participant_count=self.parse_count(h.get("hackers_count")),
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
