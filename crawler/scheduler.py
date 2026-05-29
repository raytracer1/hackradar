import asyncio
import logging
import httpx

from config import CRAWL_INTERVAL_SECONDS, BACKEND_URL, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class ApiClient:
    def __init__(self):
        self.client = httpx.Client(
            base_url=BACKEND_URL,
            timeout=REQUEST_TIMEOUT,
            headers={
                "X-API-Key": __import__("os").getenv("CRAWLER_API_KEY", "changeme-secret-key"),
                "Content-Type": "application/json",
            },
        )

    def health_check(self) -> bool:
        try:
            resp = self.client.get("/api/internal/health")
            return resp.is_success
        except Exception:
            return False

    def upsert_hackathon(self, item) -> bool:
        try:
            themes = item.themes
            if isinstance(themes, list):
                pass
            elif isinstance(themes, str):
                try:
                    import json
                    themes = json.loads(themes)
                except Exception:
                    themes = []

            payload = {
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

            resp = self.client.post("/api/hackathons", json=payload)
            if resp.is_success:
                logger.info(f"Upserted: {item.title}")
                return True
            else:
                logger.warning(f"Upsert failed [{resp.status_code}]: {item.title} — {resp.text[:200]}")
                return False
        except Exception as e:
            logger.error(f"Error upserting {item.title}: {e}")
            return False


class Scheduler:
    def __init__(self, plugins: list, interval: int | None = None):
        self.plugins = plugins
        self.interval = interval or CRAWL_INTERVAL_SECONDS

    async def run_once(self):
        """Run all plugins and POST results to the API."""
        logger.info(f"Starting crawl cycle with {len(self.plugins)} plugins")

        total = 0
        for plugin in self.plugins:
            try:
                logger.info(f"Running plugin: {plugin.name}")
                items = await plugin.fetch()
                api = ApiClient()
                for item in items:
                    if api.upsert_hackathon(item):
                        total += 1
                logger.info(f"Plugin {plugin.name}: {len(items)} scraped, {total} total upserted")
            except Exception as e:
                logger.error(f"Plugin {plugin.name} failed: {e}", exc_info=True)

        logger.info(f"Crawl cycle complete: {total} hackathons upserted")

    async def run_forever(self):
        """Run crawl cycles indefinitely."""
        logger.info(f"Scheduler started, interval={self.interval}s ({self.interval / 3600:.1f}h)")
        while True:
            await self.run_once()
            logger.info(f"Sleeping for {self.interval}s...")
            await asyncio.sleep(self.interval)
