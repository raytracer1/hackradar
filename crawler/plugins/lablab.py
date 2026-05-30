import asyncio
import logging
import re
import json
from datetime import datetime, timezone

from plugins.base import BasePlugin
from models import HackathonItem
from config import REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

LABLAB_URL = "https://lablab.ai/ai-hackathons"
LABLAB_EVENT_URL = "https://lablab.ai/event/{}"
MAX_CONCURRENT = 5


class LablabPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "lablab"

    async def fetch(self) -> list[HackathonItem]:
        """Fetch hackathons from lablab.ai by parsing the Next.js RSC payload."""
        items: list[HackathonItem] = []

        try:
            events = await self._fetch_events()
        except Exception as e:
            logger.error(f"Lablab fetch failed: {e}")
            return items

        now = datetime.now(timezone.utc)

        for ev in events:
            try:
                start_at = ev.get("startAt")
                end_at = ev.get("endAt")
                if not start_at:
                    continue

                start_date = datetime.fromisoformat(start_at.replace("Z", "+00:00"))
                end_date = (
                    datetime.fromisoformat(end_at.replace("Z", "+00:00"))
                    if end_at
                    else start_date
                )

                # Skip ended hackathons
                if end_date < now:
                    continue

                item = self._parse(ev, start_date, end_date)
                if item:
                    items.append(item)
            except Exception as e:
                logger.error(f"Lablab parse error: {e}")

        # Scrape detail pages for events without clear cash prize in listing
        await self._scrape_details(items)

        # Filter to only cash prize hackathons
        all_count = len(items)
        items = [it for it in items if self._has_cash_prize(it.prize_pool)]
        dropped = all_count - len(items)
        if dropped:
            logger.info(
                f"Lablab: {dropped}/{all_count} filtered out (no cash prize)"
            )

        return items

    async def _scrape_details(self, items: list[HackathonItem]) -> None:
        """Scrape individual event pages for prize info when missing from listing."""
        sem = asyncio.Semaphore(MAX_CONCURRENT)

        async def scrape_one(item: HackathonItem):
            if item.prize_pool:
                return  # Already have prize info from listing
            async with sem:
                prize = await self._fetch_event_prize(item.url)
                if prize:
                    item.prize_pool = prize
                    logger.debug(f"Lablab detail: {item.title} -> {prize}")

        await asyncio.gather(*[scrape_one(item) for item in items])

    async def _fetch_events(self) -> list[dict]:
        """Fetch the listing page and extract the sortedEvents array from the RSC payload."""
        from curl_cffi import requests as cffi_requests

        resp = await cffi_requests.AsyncSession().get(
            LABLAB_URL,
            impersonate="chrome110",
            headers={"Accept": "text/html"},
            timeout=REQUEST_TIMEOUT,
        )

        return self._parse_rsc_events(resp.text)

    async def _fetch_event_prize(self, url: str) -> str | None:
        """Fetch an individual event page and extract the prize pool."""
        try:
            from curl_cffi import requests as cffi_requests

            resp = await cffi_requests.AsyncSession().get(
                url,
                impersonate="chrome110",
                headers={"Accept": "text/html"},
                timeout=REQUEST_TIMEOUT,
            )

            text = resp.text
            chunks = re.findall(
                r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)',
                text,
                re.DOTALL,
            )
            decoded = []
            for chunk in chunks:
                s = json.loads('"' + chunk + '"')
                decoded.append(s)
            combined = "".join(decoded)

            # Look for "Total Prize Pool: $X" or "Prize Pool: $X"
            m = re.search(
                r'(?:Total\s+)?Prize\s+Pool\s*:\s*<strong>?\s*(\$|€|£)\s*([\d,]+)',
                combined,
                re.IGNORECASE,
            )
            if m:
                amount = int(m.group(2).replace(",", ""))
                return f"{m.group(1)}{amount:,}"

            # Fallback: use the listing-style extraction
            prize = self._extract_prize_from_text(combined)
            if prize and self._has_cash_prize(prize):
                return prize
        except Exception as e:
            logger.warning(f"Lablab detail fetch failed for {url}: {e}")

        return None

    @staticmethod
    def _parse_rsc_events(text: str) -> list[dict]:
        """Parse the RSC payload from a lablab page and return the events list."""
        chunks = re.findall(
            r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)',
            text,
            re.DOTALL,
        )
        decoded = []
        for chunk in chunks:
            s = json.loads('"' + chunk + '"')
            decoded.append(s)
        combined = "".join(decoded)

        idx = combined.find("sortedEvents")
        if idx < 0:
            logger.warning("Lablab: sortedEvents not found in page")
            return []

        start = combined.find("[", idx)
        depth = 0
        end = start
        for i in range(start, len(combined)):
            if combined[i] == "[":
                depth += 1
            elif combined[i] == "]":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break

        events = json.loads(combined[start:end])
        logger.info(f"Lablab: {len(events)} events found")
        return events

    def _parse(
        self, ev: dict, start_date: datetime, end_date: datetime
    ) -> HackathonItem | None:
        title = (ev.get("name") or "").strip()
        slug = (ev.get("slug") or "").strip()

        if not title or not slug:
            return None

        url = LABLAB_EVENT_URL.format(slug)

        description = (ev.get("description") or "").strip() or None

        # Prize: try to extract from listing description
        prize_pool = self._extract_prize_from_text(description or "")

        # Themes from technologyList
        tech_list = ev.get("technologyList") or []
        themes = []
        for tech in tech_list:
            tech_name = (tech.get("techName") or "").strip()
            if tech_name:
                themes.append(tech_name)

        image_url = (
            ev.get("imageLink") or ev.get("thumbnailLink") or None
        )
        if image_url:
            image_url = image_url.strip()

        return HackathonItem(
            source_id=f"lablab_{ev['id']}",
            source="lablab",
            title=title,
            description=description,
            url=url,
            image_url=image_url or None,
            start_date=start_date,
            end_date=end_date,
            prize_pool=prize_pool,
            themes=themes,
        )

    @staticmethod
    def _extract_prize_from_text(text: str) -> str | None:
        """Extract the largest prize amount from text content."""
        if not text:
            return None

        amounts = []

        # Pattern: "Total Prize Pool: $X"
        for m in re.finditer(
            r'(?:Total\s+)?Prize\s+Pool\s*:?\s*(?:\*\*|__|<\w+>)?\s*(\$|€|£)\s*([\d,]+)',
            text,
            re.IGNORECASE,
        ):
            try:
                amounts.append((float(m.group(2).replace(",", "")), m.group(1)))
            except ValueError:
                pass

        # Pattern: currency symbol + number with context words
        for m in re.finditer(
            r"(\$|€|£)\s*([\d,]+(?:\.[\d]+)?)\s*(?:cash\s*prize|prize|in\s*prizes?|reward)",
            text,
            re.IGNORECASE,
        ):
            try:
                amounts.append((float(m.group(2).replace(",", "")), m.group(1)))
            except ValueError:
                pass

        if not amounts:
            return None

        # Return the largest prize
        largest = max(amounts, key=lambda x: x[0])
        return f"{largest[1]}{int(largest[0]):,}"

    @staticmethod
    def _has_cash_prize(prize_pool: str | None) -> bool:
        if not prize_pool:
            return False
        cleaned = (
            prize_pool.replace(",", "")
            .replace("$", "")
            .replace("€", "")
            .replace("£", "")
        )
        m = re.search(r"[\d.]+", cleaned)
        if not m:
            return False
        try:
            return float(m.group()) > 0
        except ValueError:
            return False
