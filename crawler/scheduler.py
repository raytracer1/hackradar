import asyncio
import logging

from api_client import ApiClient
from config import CRAWL_INTERVAL_SECONDS

logger = logging.getLogger(__name__)


class Scheduler:
    def __init__(self, plugins: list, interval: int | None = None):
        self.plugins = plugins
        self.interval = interval or CRAWL_INTERVAL_SECONDS
        self.api = ApiClient()

    async def run_once(self):
        """Run all plugins once."""
        logger.info(f"Starting crawl cycle with {len(self.plugins)} plugins")

        # Check backend health first
        if not self.api.health_check():
            logger.error("Backend health check failed — skipping cycle")
            return

        total = 0
        for plugin in self.plugins:
            try:
                logger.info(f"Running plugin: {plugin.name}")
                items = await plugin.fetch()
                for item in items:
                    success = self.api.upsert_hackathon(item)
                    if success:
                        total += 1
                logger.info(f"Plugin {plugin.name}: {len(items)} scraped, {total} total upserted")
            except Exception as e:
                logger.error(f"Plugin {plugin.name} failed: {e}", exc_info=True)

        logger.info(f"Crawl cycle complete: {total} hackathons upserted")

    async def run_forever(self):
        """Run crawl cycles indefinitely at the configured interval."""
        logger.info(f"Scheduler started, interval={self.interval}s ({self.interval / 3600:.1f}h)")
        while True:
            await self.run_once()
            logger.info(f"Sleeping for {self.interval}s...")
            await asyncio.sleep(self.interval)
