import httpx
import logging
import re
from datetime import datetime, timezone

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

TAIKAI_GQL = "https://api.taikai.network/api/graphql"
TAIKAI_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# Fields to request from the GraphQL API
CHALLENGE_FIELDS = """
    id
    name
    slug
    shortDescription
    prize
    prizeCurrency { name }
    organization { name slug }
    publishInfo { state }
    isClosed
    steps { name startDate }
    currentStep { name startDate }
    coverImageFile { name url mimetype }
    participantsCount
    projectsCount
    timeZone { name offset }
    categories { name }
"""


class TaikaiPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "taikai"

    async def fetch(self) -> list[HackathonItem]:
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers=TAIKAI_HEADERS,
            timeout=REQUEST_TIMEOUT,
        ) as client:
            page = 1
            while True:
                try:
                    query = (
                        f"{{ challenges(page: {page}, perPage: 5) {{ {CHALLENGE_FIELDS} }} }}"
                    )
                    resp = await client.post(TAIKAI_GQL, json={"query": query})
                    if resp.status_code != 200:
                        logger.warning(
                            f"Taikai page {page} returned {resp.status_code}"
                        )
                        break
                    data = resp.json()
                    if "errors" in data:
                        logger.warning(
                            f"Taikai page {page} GraphQL errors: {data['errors']}"
                        )
                        break

                    challenges = data.get("data", {}).get("challenges", [])
                    if not challenges:
                        break

                    logger.info(
                        f"Taikai page {page}: {len(challenges)} items"
                    )

                    for h in challenges:
                        try:
                            item = self._parse(h)
                            if item:
                                items.append(item)
                        except Exception as e:
                            logger.error(f"Taikai parse error: {e}")

                    # If fewer than requested, we've hit the last page
                    if len(challenges) < 5:
                        break
                    page += 1
                except Exception as e:
                    logger.warning(f"Taikai page {page} error: {e}")
                    break

            # Filter out closed hackathons before parsing
            all_fetched = len(items)
            items = [it for it in items if not it.is_closed]
            closed_dropped = all_fetched - len(items)
            if closed_dropped:
                logger.info(
                    f"Taikai: {closed_dropped}/{all_fetched} filtered out (isClosed)"
                )

            # Filter to only cash prize hackathons
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(
                    f"Taikai: {dropped}/{all_count} filtered out (no cash prize)"
                )

        return items

    def _parse(self, h: dict) -> HackathonItem | None:
        title = (h.get("name") or "").strip()
        slug = (h.get("slug") or "").strip()
        org = h.get("organization") or {}
        org_slug = (org.get("slug") or "").strip()

        if not title or not slug or not org_slug:
            return None

        url = f"https://taikai.network/{org_slug}/hackathons/{slug}"

        # Parse dates from steps: earliest = start, latest = end
        steps = h.get("steps") or []
        dates = []
        for step in steps:
            sd = step.get("startDate")
            if sd:
                try:
                    dates.append(datetime.fromisoformat(sd.replace("Z", "+00:00")))
                except (ValueError, TypeError):
                    pass

        if dates:
            start_date = min(dates)
            end_date = max(dates)
        else:
            start_date = datetime.now(timezone.utc)
            end_date = datetime.now(timezone.utc)

        # Prize: numeric value + currency
        prize = h.get("prize") or 0
        currency_obj = h.get("prizeCurrency") or {}
        currency = (currency_obj.get("name") or "USD").strip()
        if prize:
            currency_symbol = self._currency_symbol(currency)
            prize_pool = f"{currency_symbol}{prize:,}"
        else:
            prize_pool = None

        # Themes from categories
        categories = h.get("categories") or []
        themes = []
        for cat in categories:
            cat_name = (cat.get("name") or "").strip()
            if cat_name:
                # Remove leading emoji/symbol prefixes (non-ASCII graphics)
                cat_name = re.sub(r"^[^\w\s]+[\s]*", "", cat_name)
                themes.append(cat_name)

        # Image from coverImageFile
        cover = h.get("coverImageFile") or {}
        image_url = (cover.get("url") or "").strip() or None

        # Description
        description = (h.get("shortDescription") or "").strip() or None

        # Timezone
        tz = h.get("timeZone") or {}
        timezone_str = (tz.get("name") or "").strip() or None

        return HackathonItem(
            source_id=f"taikai_{h['id']}",
            source="taikai",
            title=title,
            description=description,
            url=url,
            image_url=image_url,
            start_date=start_date,
            end_date=end_date,
            timezone=timezone_str,
            prize_pool=prize_pool,
            themes=themes,
            is_closed=h.get("isClosed", False),
        )

    @staticmethod
    def _currency_symbol(currency: str) -> str:
        """Map currency code to symbol."""
        symbols = {
            "USD": "$",
            "EUR": "€",
            "GBP": "£",
            "JPY": "¥",
            "CNY": "¥",
            "KRW": "₩",
            "BRL": "R$",
            "INR": "₹",
        }
        return symbols.get(currency.upper(), f"{currency} ")

    @staticmethod
    def _has_cash_prize(prize_pool: str | None) -> bool:
        if not prize_pool:
            return False
        cleaned = prize_pool.replace(",", "").replace("$", "").replace("€", "").replace("£", "")
        m = re.search(r"[\d.]+", cleaned)
        if not m:
            return False
        try:
            return float(m.group()) > 0
        except ValueError:
            return False
