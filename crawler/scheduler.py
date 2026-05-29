import asyncio
import logging
import json
from datetime import datetime

from r2_client import upload_hackathons
from config import CRAWL_INTERVAL_SECONDS

logger = logging.getLogger(__name__)


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
        "url": item.url,
        "imageUrl": item.image_url,
        "mode": item.mode,
        "location": item.location,
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
                for item in items:
                    d = item_to_dict(item)
                    if d["sourceId"] not in seen:
                        seen.add(d["sourceId"])
                        all_items.append(d)
                logger.info(f"Plugin {plugin.name}: {len(items)} scraped")
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
            logger.info(f"Sleeping for {self.interval}s...")
            await asyncio.sleep(self.interval)
