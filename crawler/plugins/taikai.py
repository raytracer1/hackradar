import asyncio
import httpx
import json
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

ORG_PAGE_SIZE = 100
CHALLENGE_PAGE_SIZE = 100
# Bounded concurrency when fetching each organization's challenges
ORG_FETCH_CONCURRENCY = 10

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
        seen_ids: set[str] = set()

        async with httpx.AsyncClient(
            headers=TAIKAI_HEADERS,
            timeout=REQUEST_TIMEOUT,
        ) as client:
            # 1) Featured open challenges are only exposed on the SSR homepage,
            #    never in the flat challenges() list (which only returns closed
            #    ones). Fetch them by slug.
            await self._fetch_homepage_featured(client, items, seen_ids)

            # 2) The organizations() and challenges() list queries are each
            #    incomplete and unstable, so union their org ids, then fetch
            #    each org's challenges via the nested query (open + closed).
            org_ids = await self._collect_org_ids(client)
            if not org_ids:
                return items

            sem = asyncio.Semaphore(ORG_FETCH_CONCURRENCY)

            async def fetch_org(org_id: str) -> None:
                async with sem:
                    await self._fetch_org_challenges(client, org_id, items, seen_ids)

            await asyncio.gather(*(fetch_org(oid) for oid in org_ids))

            # Filter to only cash prize hackathons
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(
                    f"Taikai: {dropped}/{all_count} filtered out (no cash prize)"
                )

        return items

    async def _fetch_homepage_featured(
        self,
        client: httpx.AsyncClient,
        items: list[HackathonItem],
        seen_ids: set[str],
    ) -> None:
        try:
            resp = await client.get("https://taikai.network/")
            if resp.status_code != 200:
                return
            m = re.search(
                r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
                resp.text,
                re.S,
            )
            if not m:
                return
            data = json.loads(m.group(1))
            featured = data.get("props", {}).get("pageProps", {}).get("challenges", [])
        except Exception as e:
            logger.warning(f"Taikai homepage featured error: {e}")
            return

        for f in featured:
            org_slug = (f.get("organization") or {}).get("slug")
            slug = f.get("slug")
            if not org_slug or not slug:
                continue
            try:
                query = (
                    f'{{ challengeBySlug(organizationSlug: "{org_slug}", '
                    f'challengeSlug: "{slug}") {{ {CHALLENGE_FIELDS} }} }}'
                )
                resp = await client.post(TAIKAI_GQL, json={"query": query})
                h = resp.json().get("data", {}).get("challengeBySlug")
                if not h:
                    continue
                cid = h.get("id")
                if cid and cid in seen_ids:
                    continue
                item = self._parse(h)
                if item:
                    if cid:
                        seen_ids.add(cid)
                    items.append(item)
                    logger.info(f"Taikai featured: {item.title}")
            except Exception as e:
                logger.warning(f"Taikai featured {slug} error: {e}")

    async def _collect_org_ids(self, client: httpx.AsyncClient) -> set[str]:
        org_ids: set[str] = set()

        # From the flat challenges() list (unstable ordering, so run twice)
        for _ in range(2):
            page = 1
            while True:
                try:
                    query = (
                        f"{{ challenges(page: {page}, perPage: {ORG_PAGE_SIZE}) "
                        f"{{ organization {{ id }} }} }}"
                    )
                    resp = await client.post(TAIKAI_GQL, json={"query": query})
                    if resp.status_code != 200:
                        break
                    data = resp.json()
                    if "errors" in data:
                        break
                    batch = data.get("data", {}).get("challenges", [])
                    if not batch:
                        break
                    for c in batch:
                        oid = (c.get("organization") or {}).get("id")
                        if oid:
                            org_ids.add(oid)
                    if len(batch) < ORG_PAGE_SIZE:
                        break
                    page += 1
                except Exception as e:
                    logger.warning(f"Taikai challenges page {page} error: {e}")
                    break

        # From the organizations() list
        page = 1
        while True:
            try:
                query = (
                    f"{{ organizations(page: {page}, perPage: {ORG_PAGE_SIZE}) "
                    f"{{ id }} }}"
                )
                resp = await client.post(TAIKAI_GQL, json={"query": query})
                if resp.status_code != 200:
                    break
                data = resp.json()
                if "errors" in data:
                    break
                batch = data.get("data", {}).get("organizations", [])
                if not batch:
                    break
                for o in batch:
                    if o.get("id"):
                        org_ids.add(o["id"])
                if len(batch) < ORG_PAGE_SIZE:
                    break
                page += 1
            except Exception as e:
                logger.warning(f"Taikai organizations page {page} error: {e}")
                break

        logger.info(f"Taikai: {len(org_ids)} organizations to fetch")
        return org_ids

    async def _fetch_org_challenges(
        self,
        client: httpx.AsyncClient,
        org_id: str,
        items: list[HackathonItem],
        seen_ids: set[str],
    ) -> None:
        skip = 0
        fetched = 0
        while True:
            try:
                query = (
                    f'{{ organization(id: "{org_id}") '
                    f'{{ challenges(take: {CHALLENGE_PAGE_SIZE}, skip: {skip}) '
                    f"{{ {CHALLENGE_FIELDS} }} }} }}"
                )
                resp = await client.post(TAIKAI_GQL, json={"query": query})
                if resp.status_code != 200:
                    logger.warning(
                        f"Taikai org {org_id} skip {skip} returned {resp.status_code}"
                    )
                    break
                data = resp.json()
                if "errors" in data:
                    # Orgs listed by the unstable list queries may have been
                    # deleted; skip silently on 404 instead of warning.
                    is_deleted = any(
                        e.get("code") == 404
                        or (e.get("extensions") or {}).get("code") == 404
                        for e in data["errors"]
                    )
                    if not is_deleted:
                        logger.warning(
                            f"Taikai org {org_id} skip {skip} GraphQL errors: {data['errors']}"
                        )
                    break

                challenges = (
                    data.get("data", {})
                    .get("organization", {})
                    .get("challenges", [])
                )
                if not challenges:
                    break

                for h in challenges:
                    cid = h.get("id")
                    if cid and cid in seen_ids:
                        continue
                    try:
                        item = self._parse(h)
                        if item:
                            if cid:
                                seen_ids.add(cid)
                            items.append(item)
                            fetched += 1
                    except Exception as e:
                        logger.error(f"Taikai parse error: {e}")

                if len(challenges) < CHALLENGE_PAGE_SIZE:
                    break
                skip += CHALLENGE_PAGE_SIZE
            except Exception as e:
                logger.warning(f"Taikai org {org_id} skip {skip} error: {e}")
                break

        if fetched:
            logger.info(f"Taikai org {org_id}: {fetched} items")

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
            participant_count=self.parse_count(h.get("participantsCount")),
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
