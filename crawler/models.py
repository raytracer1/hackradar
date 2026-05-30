from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HackathonItem(BaseModel):
    source_id: str
    source: str
    title: str
    description: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    start_date: datetime
    end_date: datetime
    timezone: Optional[str] = None
    prize_pool: Optional[str] = None
    themes: list[str] = []
    status: str = "active"
