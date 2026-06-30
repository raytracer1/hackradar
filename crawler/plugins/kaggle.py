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
KAGGLE_COMPETITION_URL = "https://www.kaggle.com/competitions/{}"

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

# listOption values for active competitions
LIST_OPTIONS = [
    "LIST_OPTION_ACTIVE",
    "LIST_OPTION_SPOTLIGHT_SHELF",
]

# Keywords that indicate a hackathon (in addition to the hackathon flag)
HACKATHON_KEYWORDS = [
    "hackathon", "hack", "buildathon", "codefest",
    "coding competition", "coding challenge",
]


class KagglePlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "kaggle"

    async def _get_browser_cookies(self) -> dict[str, str]:
        """Launch headless browser to get session cookies from kaggle.com."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=BROWSER_UA)
            page = await context.new_page()

            try:
                await page.goto(
                    "https://www.kaggle.com/competitions",
                    wait_until="networkidle",
                    timeout=30000,
                )
                cookies = await context.cookies()
                await page.close()
                await browser.close()
                return {c["name"]: c["value"] for c in cookies}
            except Exception as e:
                logger.error(f"Kaggle: failed to get browser cookies: {e}")
                await browser.close()
                return {}

    async def fetch(self) -> list[HackathonItem]:
        """Scrape hackathons from Kaggle competitions."""
        items: list[HackathonItem] = []

        cookies = await self._get_browser_cookies()
        if not cookies:
            logger.error("Kaggle: could not obtain browser cookies, aborting")
            return []

        async with httpx.AsyncClient(
            headers={
                "User-Agent": BROWSER_UA,
                "Origin": "https://www.kaggle.com",
                "Referer": "https://www.kaggle.com/competitions",
                "Content-Type": "application/json",
            },
            cookies=cookies,
            timeout=REQUEST_TIMEOUT,
        ) as client:
            # Collect competitions from multiple list options and deduplicate
            raw_comps: dict[int, dict] = {}

            for list_option in LIST_OPTIONS:
                try:
                    comps = await self._fetch_competitions(client, list_option)
                    for comp in comps:
                        cid = comp.get("id")
                        if cid and cid not in raw_comps:
                            raw_comps[cid] = comp
                    logger.info(
                        f"Kaggle {list_option}: {len(comps)} competitions "
                        f"(total unique: {len(raw_comps)})"
                    )
                except Exception as e:
                    logger.warning(f"Kaggle {list_option} failed: {e}")

            if not raw_comps:
                logger.warning("Kaggle: no competitions found")
                return []

            logger.info(
                f"Kaggle: {len(raw_comps)} unique competitions collected"
            )

            # Parse and filter for hackathons
            now = datetime.now(timezone.utc)
            for comp in raw_comps.values():
                try:
                    # Must be flagged as hackathon or match keywords
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

            # Scrape detail pages for full description and prize info
            if items:
                await self._scrape_all_details(client, items)

            # Filter to only cash-prize competitions
            all_count = len(items)
            items = [it for it in items if self._has_cash_prize(it.prize_pool)]
            dropped = all_count - len(items)
            if dropped:
                logger.info(
                    f"Kaggle: {dropped}/{all_count} filtered out (no cash prize)"
                )

        return items

    async def _fetch_competitions(
        self,
        client: httpx.AsyncClient,
        list_option: str,
    ) -> list[dict]:
        """Fetch competitions from Kaggle API."""
        body = {
            "selector": {
                "competitionIds": [],
                "listOption": list_option,
                "sortOption": "SORT_OPTION_DEFAULT",
                "hostSegmentIdFilter": 0,
                "searchQuery": "",
                "prestigeFilter": "PRESTIGE_FILTER_UNSPECIFIED",
                "visibilityFilter": "VISIBILITY_FILTER_UNSPECIFIED",
                "participationFilter": "PARTICIPATION_FILTER_UNSPECIFIED",
                "tagIds": [],
            }
        }

        try:
            resp = await client.post(
                "https://www.kaggle.com/api/i/competitions.CompetitionService/ListCompetitions",
                json=body,
            )
            if resp.status_code != 200:
                logger.warning(
                    f"Kaggle API returned {resp.status_code} for {list_option}"
                )
                return []

            data = resp.json()
            return data.get("competitions", [])
        except Exception as e:
            logger.warning(f"Kaggle API error for {list_option}: {e}")
            return []

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

        # Prize info
        reward = comp.get("reward") or {}
        prize_pool = None
        if reward.get("quantity") and reward.get("id"):
            currency = reward["id"]  # "USD"
            amount = reward["quantity"]
            prize_pool = f"{currency} {amount:,}"

        # Categories as themes
        themes = []
        for cat in comp.get("categories") or []:
            name = (cat.get("name") or "").strip()
            if name and name not in themes:
                themes.append(name)

        # Organization/host name
        org = comp.get("organization") or {}
        host_name = (org.get("name") or "").strip()

        # Build description
        description = brief or None

        # Cover image URL
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
            description=description,
            url=url,
            image_url=image_url,
            start_date=start_date,
            end_date=end_date,
            timezone="UTC",
            prize_pool=prize_pool,
            themes=themes,
        )

    async def _scrape_all_details(
        self, client: httpx.AsyncClient, items: list[HackathonItem]
    ) -> None:
        """Concurrently scrape competition detail pages."""
        sem = asyncio.Semaphore(MAX_CONCURRENT)

        async def scrape_one(item: HackathonItem):
            async with sem:
                detail = await self._scrape_detail(client, item.url)
                if detail:
                    if detail.get("description") and (
                        not item.description
                        or len(detail["description"]) > len(item.description)
                    ):
                        item.description = detail["description"]
                    if detail.get("about"):
                        item.about = detail["about"]
                    if detail.get("prizes_detail"):
                        item.prizes_detail = detail["prizes_detail"]
                    # Update prize pool if we found more detail
                    if (
                        detail.get("prize_pool")
                        and not item.prize_pool
                    ):
                        item.prize_pool = detail["prize_pool"]
                    logger.debug(
                        f"Kaggle detail scraped: {item.title}"
                    )

        await asyncio.gather(*[scrape_one(item) for item in items])

    async def _scrape_detail(
        self, client: httpx.AsyncClient, url: str
    ) -> dict | None:
        """Scrape a Kaggle competition page for description and prize info."""
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.warning(
                    f"Kaggle detail page returned {resp.status_code}: {url}"
                )
                return None

            soup = BeautifulSoup(resp.text, "lxml")
            result: dict = {}

            # Try to find the competition description in meta tags
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                desc = meta_desc["content"].strip()
                if desc and "Kaggle" not in desc.split(".")[0]:
                    result["description"] = desc

            # Extract text from the overview/description section
            desc_selectors = [
                '[data-testid="competition-description"]',
                '.competition__description',
                '#competition-overview',
                '[class*="description"]',
                'article',
            ]
            for sel in desc_selectors:
                el = soup.select_one(sel)
                if el:
                    text = el.get_text(" ", strip=True)
                    if text and len(text) > 100:
                        result["about"] = text
                        break

            # Look for prize-related sections
            prize_selectors = [
                '[data-testid="competition-prizes"]',
                '.competition__prizes',
                '#competition-prizes',
                '[class*="prize"]',
            ]
            for sel in prize_selectors:
                el = soup.select_one(sel)
                if el:
                    text = el.get_text(" ", strip=True)
                    if text and len(text) > 20:
                        result["prizes_detail"] = text
                        break

            # Try to extract prize amount from full page text
            if not result.get("prize_pool"):
                prize = self._extract_prize_from_text(resp.text)
                if prize:
                    result["prize_pool"] = prize

            return result if result else None
        except Exception as e:
            logger.warning(f"Kaggle detail scraping failed for {url}: {e}")
            return None

    @staticmethod
    def _extract_prize_from_text(text: str) -> str | None:
        """Extract prize amount from text content."""
        if not text:
            return None

        amounts = []

        # Pattern: "$X" near "prize" / "reward"
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

        # Pattern: "prize pool of $X" / "total prize: $X"
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
        cleaned = (
            prize_pool.replace(",", "")
            .replace("$", "")
            .replace("€", "")
            .replace("£", "")
            .replace("USD", "")
        )
        m = re.search(r"[\d.]+", cleaned)
        if not m:
            return False
        try:
            return float(m.group()) > 0
        except ValueError:
            return False
