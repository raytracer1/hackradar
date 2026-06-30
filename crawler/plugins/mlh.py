import json
import logging
import re
from datetime import datetime, timezone

import httpx

from plugins.base import BasePlugin
from models import HackathonItem
from config import REQUEST_TIMEOUT

logger = logging.getLogger(__name__)

MLH_SEASON_URL = "https://www.mlh.com/seasons/2026/events"
MLH_EVENT_URL = "https://www.mlh.com{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class MLHPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "mlh"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape MLH hackathons from the 2026 season page.

        MLH uses Inertia.js with SSR — the event data is embedded in the
        initial HTML as a JSON blob inside a <script> tag.
        """
        items: list[HackathonItem] = []

        async with httpx.AsyncClient(
            headers={"User-Agent": BROWSER_UA},
            timeout=REQUEST_TIMEOUT,
        ) as client:
            try:
                resp = await client.get(MLH_SEASON_URL)
                if resp.status_code != 200:
                    logger.error(
                        f"MLH season page returned {resp.status_code}"
                    )
                    return []
                html = resp.text
            except Exception as e:
                logger.error(f"MLH fetch failed: {e}")
                return []

            # Extract Inertia.js SSR data from <script> tag
            events_data = self._extract_inertia_data(html)
            if not events_data:
                logger.warning("MLH: could not find Inertia data in page")
                return []

            upcoming = events_data.get("upcomingEvents", [])
            logger.info(
                f"MLH: {len(upcoming)} upcoming events found "
                f"({len(events_data.get('pastEvents', []))} past)"
            )

            now = datetime.now(timezone.utc)
            for ev in upcoming:
                try:
                    item = self._parse(ev)
                    if item is None:
                        continue
                    # Skip already-ended events
                    if item.end_date < now:
                        continue
                    items.append(item)
                except Exception as e:
                    logger.error(f"MLH parse error: {e}")

        # Note: MLH events don't list explicit cash prize amounts on the
        # listing page. Prizes come from sponsors and vary per event.
        # We keep all upcoming events rather than filtering by prize pool.

        return items

    @staticmethod
    def _extract_inertia_data(html: str) -> dict | None:
        """Extract the Inertia.js page data from the HTML.

        MLH embeds it as a JSON blob inside a <script> tag with
        "component":"EventsListing".
        """
        match = re.search(
            r'<script[^>]*>\s*(\{"component"\s*:\s*"EventsListing".*?\})\s*</script>',
            html,
            re.DOTALL,
        )
        if not match:
            return None

        try:
            data = json.loads(match.group(1))
            return data.get("props", data)
        except json.JSONDecodeError as e:
            logger.warning(f"MLH: failed to parse Inertia JSON: {e}")
            return None

    def _parse(self, ev: dict) -> HackathonItem | None:
        """Parse an MLH event dict into a HackathonItem."""
        name = (ev.get("name") or "").strip()
        slug = (ev.get("slug") or "").strip()
        ev_id = (ev.get("id") or "").strip()

        if not name:
            return None

        # Build URL — prefer external website, fall back to MLH event page
        website_url = (ev.get("websiteUrl") or "").strip()
        mlh_url = MLH_EVENT_URL.format(ev.get("url", ""))

        url = website_url if website_url else mlh_url

        # Parse dates
        starts_at = ev.get("startsAt", "")
        ends_at = ev.get("endsAt", "")

        try:
            start_date = datetime.fromisoformat(
                starts_at.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            start_date = datetime.now(timezone.utc)

        try:
            end_date = datetime.fromisoformat(
                ends_at.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            end_date = start_date

        # Location / venue
        location = (ev.get("location") or "").strip()
        venue = ev.get("venueAddress") or {}
        is_online = ev.get("formatType") == "digital"

        # Build description
        desc_parts = []
        if location:
            desc_parts.append(f"Location: {location}")
        if is_online:
            desc_parts.append("Online event")
        if venue:
            city = venue.get("city", "")
            state = venue.get("state", "")
            country = venue.get("country", "")
            addr = ", ".join(p for p in [city, state, country] if p)
            if addr and addr != location:
                desc_parts.append(f"Venue: {addr}")
        description = " | ".join(desc_parts) if desc_parts else None

        # Image
        image_url = ev.get("logoUrl") or ev.get("backgroundUrl") or None

        # Themes from custom fields and format
        themes = []
        region = (ev.get("region") or "").strip()
        if region:
            themes.append(region)
        fmt = (ev.get("formatType") or "").strip()
        if fmt:
            themes.append(fmt)

        return HackathonItem(
            source_id=f"mlh_{ev_id}" if ev_id else f"mlh_{slug}",
            source="mlh",
            title=name,
            description=description,
            url=url,
            image_url=image_url,
            start_date=start_date,
            end_date=end_date,
            timezone="UTC",
            prize_pool=None,  # MLH events have sponsor prizes, no fixed amount
            themes=themes,
        )
