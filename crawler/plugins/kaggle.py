import asyncio
import json
import logging
import re
from datetime import datetime, timezone

from playwright.async_api import async_playwright

from plugins.base import BasePlugin
from models import HackathonItem

logger = logging.getLogger(__name__)

KAGGLE_COMPETITION_URL = "https://www.kaggle.com/competitions/{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

HACKATHON_KEYWORDS = [
    "hackathon", "hack", "buildathon", "codefest",
    "coding competition", "coding challenge",
]


class KagglePlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "kaggle"

    async def fetch(self) -> list[HackathonItem]:
        """Scrape hackathons from Kaggle.

        Kaggle loads its competitions via gRPC-Web API calls from the
        browser.  We launch Playwright, navigate to the competitions page,
        and intercept the API responses that the page itself triggers.
        """
        items: list[HackathonItem] = []
        raw_comps: dict[int, dict] = {}

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=BROWSER_UA)
            page = await context.new_page()

            # ---- collect every ListCompetitions response the page triggers ----
            done = asyncio.Event()

            async def on_response(response):
                if "ListCompetitions" not in response.url:
                    return
                if response.status != 200:
                    return
                try:
                    ct = response.headers.get("content-type", "")
                    if "json" not in ct:
                        return
                    body = await response.text()
                    if not body.strip():
                        return
                    data = json.loads(body)
                    comps = data.get("competitions", [])
                    for comp in comps:
                        cid = comp.get("id")
                        if cid and cid not in raw_comps:
                            raw_comps[cid] = comp
                    logger.debug(
                        f"Kaggle captured {len(comps)} comps "
                        f"(total unique: {len(raw_comps)})"
                    )
                except Exception:
                    pass

            page.on("response", on_response)

            try:
                await page.goto(
                    "https://www.kaggle.com/competitions",
                    wait_until="networkidle",
                    timeout=60000,
                )
                # Give async API calls time to finish
                await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"Kaggle page load failed: {e}")
            finally:
                await browser.close()

        if not raw_comps:
            logger.warning("Kaggle: no competitions captured from page")
            return []

        logger.info(
            f"Kaggle: {len(raw_comps)} unique competitions captured"
        )

        # Parse and filter for hackathons
        now = datetime.now(timezone.utc)
        for comp in raw_comps.values():
            try:
                is_hackathon = comp.get("hackathon", False)
                title = (comp.get("title") or "").strip()

                if not is_hackathon and not self._matches_keywords(title):
                    continue

                # Skip ended competitions
                deadline_str = comp.get("deadline", "")
                try:
                    deadline = datetime.fromisoformat(
                        deadline_str.replace("Z", "+00:00")
                    )
                except (ValueError, AttributeError):
                    continue

                if deadline < now:
                    continue

                item = self._parse(comp)
                if item:
                    items.append(item)
            except Exception as e:
                logger.error(f"Kaggle parse error: {e}")

        logger.info(
            f"Kaggle: {len(items)} hackathons identified "
            f"out of {len(raw_comps)} competitions"
        )

        # Filter to only cash-prize competitions
        all_count = len(items)
        items = [it for it in items if self._has_cash_prize(it.prize_pool)]
        dropped = all_count - len(items)
        if dropped:
            logger.info(
                f"Kaggle: {dropped}/{all_count} filtered out (no cash prize)"
            )

        return items

    @staticmethod
    def _matches_keywords(title: str) -> bool:
        """Check if title contains hackathon-related keywords."""
        title_lower = title.lower()
        for kw in HACKATHON_KEYWORDS:
            if kw in title_lower:
                return True
        return False

    def _parse(self, comp: dict) -> HackathonItem | None:
        """Parse a Kaggle competition dict into a HackathonItem."""
        title = (comp.get("title") or "").strip()
        comp_name = (comp.get("competitionName") or "").strip()

        if not title or not comp_name:
            return None

        url = KAGGLE_COMPETITION_URL.format(comp_name)
        brief = (comp.get("briefDescription") or "").strip()

        # Parse dates
        start_str = comp.get("dateEnabled", "")
        deadline_str = comp.get("deadline", "")

        try:
            start_date = datetime.fromisoformat(
                start_str.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            start_date = datetime.now(timezone.utc)

        try:
            end_date = datetime.fromisoformat(
                deadline_str.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            end_date = start_date

        # Prize info — skip non-cash rewards (KNOWLEDGE = swag/points)
        reward = comp.get("reward") or {}
        prize_pool = None
        rid = reward.get("id", "")
        if reward.get("quantity") and rid and rid not in ("KNOWLEDGE",):
            prize_pool = f"{rid} {reward['quantity']:,}"

        # Categories as themes
        themes = []
        for cat in comp.get("categories") or []:
            name = (cat.get("name") or "").strip()
            if name and name not in themes:
                themes.append(name)

        # Cover image
        image_url = None
        cid = comp.get("id")
        if cid and comp.get("hasCoverImageUrl"):
            image_url = (
                f"https://storage.googleapis.com/kaggle-competitions/"
                f"{cid}/thumbnail.png"
            )

        return HackathonItem(
            source_id=f"kaggle_{cid}" if cid else f"kaggle_{comp_name}",
            source="kaggle",
            title=title,
            description=brief or None,
            url=url,
            image_url=image_url,
            start_date=start_date,
            end_date=end_date,
            timezone="UTC",
            prize_pool=prize_pool,
            themes=themes,
        )

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
