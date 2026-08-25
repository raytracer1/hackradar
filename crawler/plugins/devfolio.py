import httpx
import json
import logging
from datetime import datetime

from bs4 import BeautifulSoup

from plugins.base import BasePlugin
from models import HackathonItem
from config import USER_AGENT, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

# The devfolio.co/hackathons page is a Next.js app: the hackathon data lives
# in the embedded __NEXT_DATA__ JSON (dehydratedState), not in the DOM.
# The listing payload has no cover image or description — those come from the
# per-hackathon detail API, prize amounts from the prizes API.
LISTING_URL = "https://devfolio.co/hackathons"
DETAIL_API = "https://api.devfolio.co/api/hackathons/{slug}"
PRIZES_API = "https://api.devfolio.co/api/hackathons/{slug}/prizes"


class DevfolioPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "devfolio"

    async def fetch(self) -> list[HackathonItem]:
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            raw_items = await self._fetch_listing(client)
            if not raw_items:
                return items

            for it in raw_items:
                try:
                    item = await self._build_item(client, it)
                    if item:
                        items.append(item)
                except Exception as e:
                    logger.error(f"Devfolio item error ({it.get('slug')}): {e}")

        return items

    async def _fetch_listing(self, client: httpx.AsyncClient) -> list[dict]:
        try:
            resp = await client.get(LISTING_URL)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")
            node = soup.select_one("#__NEXT_DATA__")
            if not node:
                logger.error("Devfolio: no __NEXT_DATA__ in listing page")
                return []
            payload = json.loads(node.string)
            data = (
                payload.get("props", {})
                .get("pageProps", {})
                .get("dehydratedState", {})
                .get("queries", [{}])[0]
                .get("state", {})
                .get("data", {})
            )
        except Exception as e:
            logger.error(f"Devfolio listing fetch failed: {e}")
            return []

        seen: set[str] = set()
        result: list[dict] = []
        for key in ("open_hackathons", "upcoming_hackathons"):
            for it in data.get(key) or []:
                uuid = it.get("uuid")
                if not uuid or uuid in seen:
                    continue
                seen.add(uuid)
                result.append(it)
        return result

    async def _build_item(
        self, client: httpx.AsyncClient, it: dict
    ) -> HackathonItem | None:
        slug = it.get("slug") or ""
        name = it.get("name") or ""
        if not slug or not name:
            return None

        # Detail API: cover image + description + timezone (the listing
        # payload carries none of these).
        cover_img = None
        description = None
        timezone_str = it.get("timezone")
        try:
            resp = await client.get(DETAIL_API.format(slug=slug))
            if resp.status_code == 200:
                detail = resp.json() or {}
                cover_img = detail.get("cover_img")
                description = (detail.get("desc") or "").strip()[:1500] or None
                timezone_str = detail.get("timezone") or timezone_str
        except Exception:
            pass

        prize_pool = None
        prizes_detail = None
        try:
            resp = await client.get(PRIZES_API.format(slug=slug))
            if resp.status_code == 200:
                prizes = resp.json() or []
                # Cash prizes only: devfolio credits carry ": Credits" in the
                # name; zero-amount entries are swag/certificates.
                cash_prizes = [
                    p for p in prizes
                    if "credit" not in (p.get("name") or "").lower()
                ]
                # Prefer the aggregate "Total Prize Pool" entry; otherwise
                # sum the individual cash entries.
                total_entry = next(
                    (
                        p
                        for p in cash_prizes
                        if (p.get("name") or "").strip().lower() == "total prize pool"
                    ),
                    None,
                )
                pool = [total_entry] if total_entry else cash_prizes
                total = sum(float(p.get("amount") or 0) for p in pool)
                if total > 0:
                    currency = (pool[0].get("currency") or "USD").upper()
                    symbol = "$" if currency == "USD" else f"{currency} "
                    prize_pool = f"{symbol}{total:,.0f}"

                # Per-prize detail for the detail pane: one "rank — amount"
                # line per cash prize, nothing else.
                lines = []
                for p in prizes:
                    pname = (p.get("name") or "").strip()
                    if not pname or pname.lower() == "total prize pool":
                        continue
                    if "credit" in pname.lower():
                        continue
                    try:
                        amt = float(p.get("amount") or 0)
                    except (ValueError, TypeError):
                        amt = 0
                    if amt <= 0:
                        continue
                    pcur = (p.get("currency") or "USD").upper()
                    psym = "$" if pcur == "USD" else f"{pcur} "
                    lines.append(f"{pname} — {psym}{amt:,.0f}")
                prizes_detail = "\n".join(lines) if lines else None
        except Exception:
            pass

        themes = [
            t.get("theme", {}).get("name")
            for t in (it.get("themes") or [])
            if (t.get("theme") or {}).get("name")
        ]

        return HackathonItem(
            source_id=f"devfolio_{it.get('uuid')}",
            source="devfolio",
            title=name,
            description=description,
            url=f"https://{slug}.devfolio.co/",
            image_url=cover_img,
            start_date=self._parse_dt(it.get("starts_at")) or datetime.now(),
            end_date=self._parse_dt(it.get("ends_at")) or datetime.now(),
            timezone=timezone_str,
            prize_pool=prize_pool,
            prizes_detail=prizes_detail,
            themes=themes,
            participant_count=self.parse_count(it.get("participants_count")),
        )

    @staticmethod
    def _parse_dt(value) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(str(value))
        except ValueError:
            return None
