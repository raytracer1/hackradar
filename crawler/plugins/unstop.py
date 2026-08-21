import httpx
import logging
import re
from datetime import datetime

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

# unstop.com/hackathons is an Angular SPA — its HTML is a JS shell with no
# listing data, so we hit the same public JSON API their frontend uses.
# oppstatus=open filters to hackathons that are currently open.
API_URL = "https://unstop.com/api/public/opportunity/search-result"
PER_PAGE = 100

CURRENCY_SYMBOLS = {
    "usd": "$",
    "inr": "₹",
    "fa-rupee": "₹",
    "eur": "€",
    "gbp": "£",
}


class UnstopPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "unstop"

    async def fetch(self) -> list[HackathonItem]:
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
                "Referer": "https://unstop.com/hackathons",
            },
            timeout=REQUEST_TIMEOUT,
        ) as client:
            page = 1
            while True:
                try:
                    resp = await client.get(
                        API_URL,
                        params={
                            "opportunity": "hackathons",
                            "oppstatus": "open",
                            "page": page,
                            "per_page": PER_PAGE,
                        },
                    )
                    resp.raise_for_status()
                    payload = resp.json()
                except Exception as e:
                    logger.error(f"Unstop fetch failed (page {page}): {e}")
                    break

                page_data = payload.get("data") or {}
                batch = page_data.get("data") or []
                if not batch:
                    break

                for raw in batch:
                    try:
                        item = self._parse_item(raw)
                        if item:
                            items.append(item)
                    except Exception as e:
                        logger.error(f"Unstop item parse error: {e}")

                last_page = page_data.get("last_page") or 1
                if page >= last_page:
                    break
                page += 1

        return items

    def _parse_item(self, raw: dict) -> HackathonItem | None:
        title = raw.get("title") or ""
        public_url = raw.get("public_url") or ""
        if not title or not public_url:
            return None

        url = raw.get("seo_url") or f"https://unstop.com/{public_url}"

        end_date = self._parse_dt(raw.get("end_date"))
        # The list payload has no event start date — registration start is the
        # closest available signal.
        regn = raw.get("regnRequirements") or {}
        start_date = self._parse_dt(raw.get("start_date") or regn.get("start_regn_dt"))
        if start_date is None:
            start_date = end_date or datetime.now()
        if end_date is None:
            end_date = start_date

        prize_pool = None
        prizes = raw.get("prizes") or []
        cash = sum(float(p.get("cash") or 0) for p in prizes)
        if cash > 0:
            currency = (prizes[0].get("currency") or "").lower()
            symbol = CURRENCY_SYMBOLS.get(currency, "$")
            prize_pool = f"{symbol}{cash:,.0f}"

        themes = [f.get("name") for f in (raw.get("filters") or []) if f.get("name")]

        # Plain-text description for search/detail — strip HTML tags.
        details = raw.get("details") or ""
        description = re.sub(r"<[^>]+>", " ", details)
        description = re.sub(r"\s+", " ", description).strip()[:1000] or None

        return HackathonItem(
            source_id=f"unstop_{raw.get('id')}",
            source="unstop",
            title=title,
            description=description,
            url=url,
            image_url=raw.get("logoUrl2"),
            start_date=start_date,
            end_date=end_date,
            prize_pool=prize_pool,
            themes=themes,
        )

    @staticmethod
    def _parse_dt(value) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(str(value))
        except ValueError:
            return None
