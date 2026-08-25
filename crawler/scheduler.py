import asyncio
import logging
import json
import re
import random
from datetime import datetime

from r2_client import upload_hackathons
from config import CRAWL_INTERVAL_SECONDS

logger = logging.getLogger(__name__)


def has_cash_prize(prize_pool: str | None) -> bool:
    """Return True if prize_pool indicates a non-zero cash prize."""
    if not prize_pool:
        return False
    # Extract the first number (supports "$10,000", "10000", "10k USD", etc.)
    cleaned = prize_pool.replace(",", "").replace("$", "")
    m = re.search(r"[\d.]+", cleaned)
    if not m:
        return False
    try:
        amount = float(m.group())
    except ValueError:
        return False
    return amount > 0


def normalize_themes(themes) -> list[str]:
    """Devpost returns themes as list of dicts, others return list of strings."""
    result = []
    for t in (themes or []):
        if isinstance(t, dict):
            name = t.get("name", t.get("title", str(t)))
            if name:
                result.append(name)
        elif isinstance(t, str):
            result.append(t)
        else:
            result.append(str(t))
    return result


def item_to_dict(item) -> dict:
    themes = normalize_themes(item.themes)
    return {
        "title": item.title,
        "description": item.description,
        "about": item.about,
        "whatToBuild": item.what_to_build,
        "whatToSubmit": item.what_to_submit,
        "prizesDetail": item.prizes_detail,
        "participantCount": item.participant_count,
        "eligibility": item.eligibility,
        "url": item.url,
        "imageUrl": item.image_url,
        "startDate": item.start_date.isoformat() if hasattr(item.start_date, "isoformat") else str(item.start_date),
        "endDate": item.end_date.isoformat() if hasattr(item.end_date, "isoformat") else str(item.end_date),
        "timezone": item.timezone,
        "prizePool": item.prize_pool,
        "themes": themes,
        "sourceId": item.source_id,
        "source": item.source,
        "status": item.status,
    }


class Scheduler:
    def __init__(self, plugins: list, interval: int | None = None):
        self.plugins = plugins
        self.interval = interval or CRAWL_INTERVAL_SECONDS

    async def run_once(self):
        """Run all plugins, combine results, and upload to R2."""
        logger.info(f"Starting crawl cycle with {len(self.plugins)} plugins")

        seen = set()
        all_items: list[dict] = []
        for plugin in self.plugins:
            try:
                logger.info(f"Running plugin: {plugin.name}")
                items = await plugin.fetch()
                kept = 0
                dropped = 0
                # mlh / luma events often have sponsor prizes without fixed
                # amounts — skip the global cash-prize filter for them.
                # (devfolio is filtered: its prizes API returns real amounts.)
                SKIP_PRIZE_FILTER = {"mlh", "luma"}

                for item in items:
                    d = item_to_dict(item)
                    if d["sourceId"] not in seen:
                        seen.add(d["sourceId"])
                        if (
                            d["source"] in SKIP_PRIZE_FILTER
                            or has_cash_prize(d["prizePool"])
                        ):
                            all_items.append(d)
                            kept += 1
                        else:
                            dropped += 1
                            logger.debug(f"Filtered out (no cash prize): {d['title']} (prizePool={d['prizePool']!r})")
                logger.info(f"Plugin {plugin.name}: {len(items)} scraped, {kept} kept (cash prize), {dropped} dropped (no cash/zero)")
            except Exception as e:
                logger.error(f"Plugin {plugin.name} failed: {e}", exc_info=True)

        if all_items:
            success = upload_hackathons(all_items)
            logger.info(f"Crawl cycle complete: {len(all_items)} hackathons, upload {'success' if success else 'failed'}")
        else:
            logger.info("No items scraped, skipping upload")

    async def run_forever(self):
        """Run crawl cycles indefinitely."""
        logger.info(f"Scheduler started, interval={self.interval}s ({self.interval / 3600:.1f}h)")
        while True:
            await self.run_once()
            jitter = random.randint(-30 * 60, 30 * 60)
            sleep_seconds = self.interval + jitter
            logger.info(f"Sleeping for {sleep_seconds}s ({self.interval}s + {jitter}s jitter)...")
            await asyncio.sleep(sleep_seconds)
