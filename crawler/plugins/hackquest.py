import json
import logging
import re
from datetime import datetime, timezone

import httpx

from plugins.base import BasePlugin
from models import HackathonItem
from config import REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

HACKQUEST_URL = "https://www.hackquest.io/zh-cn/hackathons"
HACKQUEST_EVENT_URL = "https://www.hackquest.io/zh-cn/hackathons/{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class HackquestPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "hackquest"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape hackathons from hackquest.io.

        HackQuest uses Next.js with React Server Components — the event data
        is embedded in the initial HTML via self.__next_f.push() payloads.
        """
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": BROWSER_UA},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                resp = await client.get(HACKQUEST_URL)
                if resp.status_code != 200:
                    logger.error(
                        f"HackQuest page returned {resp.status_code}"
                    )
                    return []
                html = resp.text
            except Exception as e:
                logger.error(f"HackQuest fetch failed: {e}")
                return []

            # Parse the RSC payload
            combined = self._decode_rsc_payload(html)
            if not combined:
                logger.warning("HackQuest: could not decode RSC payload")
                return []

            # Extract hackathon data blocks
            hackathons = self._extract_hackathon_data(combined)
            logger.info(
                f"HackQuest: {len(hackathons)} hackathons extracted"
            )

            now = datetime.now(timezone.utc)
            for ev in hackathons:
                try:
                    item = self._parse(ev)
                    if item is None:
                        continue
                    if item.end_date < now:
                        continue
                    items.append(item)
                except Exception as e:
                    logger.error(f"HackQuest parse error: {e}")

            # Filter to only cash-prize hackathons
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(
                    f"HackQuest: {dropped}/{all_count} filtered out "
                    f"(no cash prize)"
                )

        return items

    @staticmethod
    def _decode_rsc_payload(html: str) -> str:
        """Decode the Next.js RSC payload from self.__next_f.push() calls."""
        chunks = re.findall(
            r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)',
            html,
            re.DOTALL,
        )
        decoded = []
        for chunk in chunks:
            try:
                s = json.loads('"' + chunk + '"')
                decoded.append(s)
            except json.JSONDecodeError:
                pass
        return "".join(decoded)

    @staticmethod
    def _extract_hackathon_data(combined: str) -> list[dict]:
        """Extract all hackathon data array objects from the RSC payload."""
        all_hackathons: list[dict] = []

        for m in re.finditer(r'\{"data":\[', combined):
            start = m.start()
            depth = 0
            end = start
            for i in range(start, min(start + 200000, len(combined))):
                if combined[i] == "{":
                    depth += 1
                elif combined[i] == "}":
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            try:
                obj = json.loads(combined[start:end])
                data = obj.get("data", [])
                for item in data:
                    if isinstance(item, dict) and "name" in item and "alias" in item:
                        all_hackathons.append(item)
            except json.JSONDecodeError:
                continue

        return all_hackathons

    def _parse(self, ev: dict) -> HackathonItem | None:
        """Parse a HackQuest hackathon dict into a HackathonItem."""
        name = (ev.get("name") or "").strip()
        alias = (ev.get("alias") or "").strip()

        if not name or not alias:
            return None

        url = HACKQUEST_EVENT_URL.format(alias)

        # Info fields
        info = ev.get("info") or {}
        intro = (info.get("intro") or "").strip()
        description_html = (info.get("description") or "").strip()

        # Build description — prefer intro, fallback to stripped HTML
        description = intro if intro else self._strip_html(description_html) or None

        # Cover image
        image_url = (info.get("image") or "").strip() or None

        # Timeline
        timeline = ev.get("timeline") or {}
        tz_str = timeline.get("timeZone") or None
        start_str = timeline.get("registrationOpen", "")
        end_str = timeline.get("submissionClose", "")

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
        prize_pool = self._extract_prize(ev)

        # Themes from ecosystem and tech stack
        themes: list[str] = []
        for eco in ev.get("ecosystem") or []:
            eco_type = (eco.get("type") or "").strip()
            if eco_type:
                themes.append(eco_type)
        for tech in info.get("teachStack") or []:
            tech = tech.strip()
            if tech and tech not in themes:
                themes.append(tech)

        # Mode
        mode = (info.get("mode") or "").strip()
        if mode:
            themes.append(mode.lower())

        # Host/organizer
        host = (info.get("host") or "").strip()

        return HackathonItem(
            source_id=f"hackquest_{ev.get('id', alias)}",
            source="hackquest",
            title=name,
            description=description,
            about=self._strip_html(description_html) if description_html else None,
            url=url,
            image_url=image_url,
            start_date=start_date,
            end_date=end_date,
            timezone=tz_str,
            prize_pool=prize_pool,
            themes=themes,
        )

    @staticmethod
    def _extract_prize(ev: dict) -> str | None:
        """Extract prize pool from reward data."""
        total_rewards = ev.get("totalRewards", "")
        rewards = ev.get("rewards") or []

        # Determine dominant currency from rewards array
        currency = "USD"
        if rewards:
            currencies = {}
            for r in rewards:
                cur = r.get("currency", "USD")
                amt = r.get("totalRewards", 0)
                currencies[cur] = currencies.get(cur, 0) + amt
            if currencies:
                currency = max(currencies, key=currencies.get)

        # Use totalRewards if available, otherwise sum from rewards
        try:
            total = float(total_rewards) if total_rewards else 0
        except (ValueError, TypeError):
            total = 0

        if total == 0 and rewards:
            for r in rewards:
                if r.get("currency") == currency:
                    total += r.get("totalRewards", 0)

        if total > 0:
            return f"{currency} {int(total):,}"

        return None

    @staticmethod
    def _strip_html(text: str) -> str:
        """Strip HTML tags from text."""
        if not text:
            return ""
        return re.sub(r"<[^>]+>", " ", text).strip()

    @staticmethod
    def _has_cash_prize(prize_pool: str | None) -> bool:
        """Return True if prize_pool indicates a non-zero cash prize."""
        if not prize_pool:
            return False
        cleaned = re.sub(r"[^\d.]", "", prize_pool.replace(",", ""))
        m = re.search(r"[\d.]+", cleaned)
        if not m:
            return False
        try:
            return float(m.group()) > 0
        except ValueError:
            return False
