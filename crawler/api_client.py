import httpx
import logging
from typing import Any

from config import BACKEND_URL, API_KEY, REQUEST_TIMEOUT
from models import HackathonItem

logger = logging.getLogger(__name__)


class ApiClient:
    def __init__(self):
        self.client = httpx.Client(
            base_url=BACKEND_URL,
            timeout=REQUEST_TIMEOUT,
            headers={
                "X-API-Key": API_KEY,
                "Content-Type": "application/json",
            },
        )

    def health_check(self) -> bool:
        try:
            resp = self.client.get("/api/internal/health")
            return resp.is_success
        except Exception:
            return False

    def upsert_hackathon(self, item: HackathonItem) -> bool:
        try:
            payload = {
                "sourceId": item.source_id,
                "source": item.source,
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
                "themes": item.themes,
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
