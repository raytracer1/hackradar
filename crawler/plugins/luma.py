import asyncio
import logging
import re
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from plugins.base import BasePlugin
from models import HackathonItem
from config import REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

MAX_CONCURRENT = 5
LUMA_EVENT_URL = "https://luma.com/{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

# Categories on luma.com that are likely to contain hackathons
HACKATHON_CATEGORIES = ["tech", "ai"]

# Search queries for the discover API
SEARCH_QUERIES = [
    "hackathon",
    "hack",
    "thon",          # catches "IP-A-THON", "build-a-thon" etc.
    "$100",          # events with cash prizes
    "prize pool",
]

# Major tech hubs — search from each city to overcome geo-bias.
# luma blocks some regions (403), so we stick to cities that work.
CITY_COORDS = [
    (40.7128, -74.0060),   # New York
    (37.7749, -122.4194),  # San Francisco
    (51.5074, -0.1278),    # London
    (35.6762, 139.6503),   # Tokyo
    (1.3521, 103.8198),    # Singapore
    (52.5200, 13.4050),    # Berlin
]

# Keywords that indicate a hackathon event
HACKATHON_KEYWORDS = [
    "hackathon", "hack", "buildathon", "codefest",
    "coding competition", "build competition",
    "thon",           # IP-A-THON, build-a-thon, etc.
    "challenge",
]


class LumaPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "luma"

    async def _get_browser_cookies(self) -> dict[str, str]:
        """Launch headless browser to get session cookies from luma.com."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=BROWSER_UA)
            page = await context.new_page()

            try:
                await page.goto(
                    "https://luma.com/discover",
                    wait_until="networkidle",
                    timeout=30000,
                )
                cookies = await context.cookies()
                await page.close()
                await browser.close()
                return {c["name"]: c["value"] for c in cookies}
            except Exception as e:
                logger.error(f"Luma: failed to get browser cookies: {e}")
                await browser.close()
                return {}

    async def fetch(self) -> list[HackathonItem]:
        """Scrape hackathons from luma.com by calling the discover API.

        Luma's API is geo-biased — it only returns events near the
        request's IP.  We overcome this by issuing searches from a list
        of major tech-hub city coordinates so we get global coverage.
        """
        items: list[HackathonItem] = []

        cookies = await self._get_browser_cookies()
        if not cookies:
            logger.error("Luma: could not obtain browser cookies, aborting")
            return []

        async with httpx.AsyncClient(
            headers={
                "User-Agent": BROWSER_UA,
                "Origin": "https://luma.com",
                "Referer": "https://luma.com/discover",
            },
            cookies=cookies,
            timeout=REQUEST_TIMEOUT,
        ) as client:
            raw_events: dict[str, dict] = {}

            # Search from each city
            for lat, lng in CITY_COORDS:
                city_count = 0
                # a) Keyword searches
                for query in SEARCH_QUERIES:
                    try:
                        events = await self._fetch_events(
                            client,
                            search_query=query,
                            latitude=lat,
                            longitude=lng,
                            max_pages=2,
                        )
                        for ev in events:
                            eid = ev.get("api_id", "")
                            if eid and eid not in raw_events:
                                raw_events[eid] = ev
                                city_count += 1
                    except Exception as e:
                        logger.debug(
                            f"Luma search '{query}' @ ({lat:.1f},{lng:.1f}): {e}"
                        )

                # b) Category browsing
                for cat in HACKATHON_CATEGORIES:
                    try:
                        events = await self._fetch_events(
                            client,
                            slug=cat,
                            latitude=lat,
                            longitude=lng,
                            max_pages=2,
                        )
                        for ev in events:
                            eid = ev.get("api_id", "")
                            if eid and eid not in raw_events:
                                raw_events[eid] = ev
                                city_count += 1
                    except Exception as e:
                        logger.debug(
                            f"Luma cat '{cat}' @ ({lat:.1f},{lng:.1f}): {e}"
                        )

                if city_count:
                    logger.info(
                        f"Luma: {city_count} new events from ({lat:.1f}, {lng:.1f}) "
                        f"(total unique: {len(raw_events)})"
                    )

            if not raw_events:
                logger.warning("Luma: no events found from any city")
                return []

            logger.info(f"Luma: {len(raw_events)} unique events collected")

            # Parse events and filter for hackathons
            for ev in raw_events.values():
                try:
                    event_data = ev.get("event", ev)
                    name = (event_data.get("name") or "").strip()

                    if not self._is_hackathon(name, event_data):
                        continue

                    item = self._parse(event_data)
                    if item:
                        # Counts live on the raw entry (siblings of `event`),
                        # not on event_data itself. Prefer guest_count
                        # (registrants) over ticket_count (tickets sold).
                        if item.participant_count is None:
                            item.participant_count = self.parse_count(
                                ev.get("guest_count") or ev.get("ticket_count")
                            ) or self.parse_count(
                                event_data.get("guest_count")
                                or event_data.get("ticket_count")
                            )
                        items.append(item)
                except Exception as e:
                    logger.error(f"Luma parse error: {e}")

            logger.info(
                f"Luma: {len(items)} hackathon events identified "
                f"out of {len(raw_events)} total"
            )

            # Scrape detail pages for description and prize info
            if items:
                await self._scrape_all_details(client, items)

            # Luma event pages rarely list explicit cash prizes even for
            # real hackathons — keep all identified hackathons.
            if items:
                logger.info(
                    f"Luma: {len(items)} hackathon events kept "
                    f"(no cash-prize filter for luma)"
                )

        return items

    async def _fetch_events(
        self,
        client: httpx.AsyncClient,
        slug: str | None = None,
        search_query: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        max_pages: int = 2,
    ) -> list[dict]:
        """Fetch events from luma discover API, handling pagination."""
        events: list[dict] = []
        params: dict = {"pagination_limit": 25}
        if slug:
            params["slug"] = slug
        if search_query:
            params["search_query"] = search_query
        if latitude is not None and longitude is not None:
            params["latitude"] = str(latitude)
            params["longitude"] = str(longitude)

        for page in range(max_pages):
            try:
                resp = await client.get(
                    "https://api.luma.com/discover/get-paginated-events",
                    params=params,
                )
                if resp.status_code != 200:
                    break

                data = resp.json()
                entries = data.get("entries", [])
                if not entries:
                    break
                events.extend(entries)

                cursor = (
                    data.get("next_cursor") or data.get("pagination_cursor")
                )
                if cursor:
                    params["pagination_cursor"] = cursor
                else:
                    break

            except Exception as e:
                logger.debug(f"Luma API page {page} error: {e}")
                break

        return events

    @staticmethod
    def _is_hackathon(name: str, event_data: dict) -> bool:
        """Check if an event is likely a hackathon based on name and metadata."""
        name_lower = name.lower()

        # Direct keyword match
        for kw in HACKATHON_KEYWORDS:
            if kw in name_lower:
                return True

        # Check event_type
        event_type = (event_data.get("event_type") or "").lower()
        if "hackathon" in event_type:
            return True

        # Check topic_tags
        topic_tags = event_data.get("topic_tags") or []
        for tag in topic_tags:
            tag_name = ""
            if isinstance(tag, dict):
                tag_name = (tag.get("name") or "").lower()
            else:
                tag_name = str(tag).lower()
            for kw in HACKATHON_KEYWORDS:
                if kw in tag_name:
                    return True

        return False

    async def _scrape_all_details(
        self, client: httpx.AsyncClient, items: list[HackathonItem]
    ) -> None:
        """Concurrently scrape event detail pages for description and prize info."""
        sem = asyncio.Semaphore(MAX_CONCURRENT)

        async def scrape_one(item: HackathonItem):
            async with sem:
                detail = await self._scrape_detail(client, item.url)
                if detail:
                    if detail.get("description"):
                        item.description = detail["description"]
                    if detail.get("about"):
                        item.about = detail["about"]
                    if detail.get("prize_pool") and not item.prize_pool:
                        item.prize_pool = detail["prize_pool"]
                    logger.debug(
                        f"Luma detail scraped: {item.title}"
                    )

        await asyncio.gather(*[scrape_one(item) for item in items])

    async def _scrape_detail(
        self, client: httpx.AsyncClient, url: str
    ) -> dict | None:
        """Scrape a luma event detail page for description and prize info."""
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.warning(f"Luma detail page returned {resp.status_code}: {url}")
                return None

            soup = BeautifulSoup(resp.text, "lxml")
            result: dict = {}

            # Extract description from meta tags
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                result["description"] = meta_desc["content"].strip()

            # Extract from __NEXT_DATA__
            next_data = soup.find("script", id="__NEXT_DATA__")
            if next_data and next_data.string:
                import json
                try:
                    data = json.loads(next_data.string)
                    page_props = (
                        data.get("props", {})
                        .get("pageProps", {})
                        .get("initialData", {})
                    )
                    event_data = page_props.get("data", page_props)

                    ev = event_data.get("event", event_data)
                    if not result.get("description") and ev.get("description"):
                        result["description"] = ev["description"]

                    cal = event_data.get("calendar", {})
                    if (
                        not result.get("description")
                        and cal.get("description_short")
                    ):
                        result["description"] = cal["description_short"]

                    if ev.get("description_long") or ev.get("description_html"):
                        result["about"] = ev.get(
                            "description_long"
                        ) or ev.get("description_html")
                except json.JSONDecodeError:
                    pass

            # Fallback: extract text from the body
            if not result.get("description"):
                body_text = soup.get_text(" ", strip=True)
                for para in body_text.split("."):
                    para = para.strip()
                    if len(para) > 80 and len(para) < 500:
                        result["description"] = para + "."
                        break

            # Look for prize-related text
            if not result.get("prize_pool"):
                prize = self._extract_prize_from_text(resp.text)
                if prize:
                    result["prize_pool"] = prize

            return result if result else None
        except Exception as e:
            logger.warning(f"Luma detail scraping failed for {url}: {e}")
            return None

    @staticmethod
    def _extract_prize_from_text(text: str) -> str | None:
        """Extract prize amount from text content."""
        if not text:
            return None

        amounts = []

        # "$X in prizes" / "Prize pool: $X"
        for m in re.finditer(
            r"(\$|€|£|USD)\s*([\d,]+(?:\.[\d]+)?)\s*(?:in\s+)?(?:cash\s*)?(?:prize|reward|pool)",
            text,
            re.IGNORECASE,
        ):
            try:
                amounts.append(
                    (float(m.group(2).replace(",", "")), m.group(1))
                )
            except ValueError:
                pass

        # "prize pool of $X"
        for m in re.finditer(
            r"(?:prize|reward)\s*(?:pool|fund)?\s*(?:of|:)?\s*(?:up\s*to\s*)?(\$|€|£|USD)\s*([\d,]+)",
            text,
            re.IGNORECASE,
        ):
            try:
                amounts.append(
                    (float(m.group(2).replace(",", "")), m.group(1))
                )
            except ValueError:
                pass

        if not amounts:
            return None

        largest = max(amounts, key=lambda x: x[0])
        return f"{largest[1]}{int(largest[0]):,}"

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

    def _parse(self, ev: dict) -> HackathonItem | None:
        """Parse a luma event dict into a HackathonItem."""
        name = (ev.get("name") or "").strip()
        url_slug = (ev.get("url") or "").strip()
        api_id = (ev.get("api_id") or "").strip()

        if not name:
            return None

        url = LUMA_EVENT_URL.format(url_slug) if url_slug else ""

        # Parse dates
        start_at = ev.get("start_at", "")
        end_at = ev.get("end_at", "")

        try:
            start_date = datetime.fromisoformat(
                start_at.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            start_date = datetime.now(timezone.utc)

        try:
            end_date = datetime.fromisoformat(
                end_at.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            end_date = start_date

        # Skip ended events
        now = datetime.now(timezone.utc)
        if end_date < now:
            return None

        # Location info
        geo = ev.get("geo_address_info") or {}
        location_parts = []
        for key in ("city", "region"):
            val = geo.get(key)
            if val:
                location_parts.append(val)
        location = ", ".join(location_parts) if location_parts else None

        description = ev.get("description") or None
        if not description and location:
            description = f"Location: {location}"

        tz = ev.get("timezone") or None
        image_url = ev.get("cover_url") or None

        # Tags from topic_tags
        themes = []
        topic_tags = ev.get("topic_tags") or []
        for tag in topic_tags:
            if isinstance(tag, dict):
                tag_name = (tag.get("name") or "").strip()
            else:
                tag_name = str(tag).strip()
            if tag_name:
                themes.append(tag_name)

        return HackathonItem(
            source_id=f"luma_{api_id}" if api_id else f"luma_{url_slug}",
            source="luma",
            title=name,
            description=description,
            url=url,
            image_url=image_url,
            start_date=start_date,
            end_date=end_date,
            timezone=tz,
            prize_pool=None,  # Filled by detail scraper
            themes=themes,
        )
