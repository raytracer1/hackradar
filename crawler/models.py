from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HackathonItem(BaseModel):
    source_id: str
    source: str
    title: str
    description: Optional[str] = None
    about: Optional[str] = None
    what_to_build: Optional[str] = None
    what_to_submit: Optional[str] = None
    prizes_detail: Optional[str] = None
    eligibility: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    start_date: datetime
    end_date: datetime
    timezone: Optional[str] = None
    prize_pool: Optional[str] = None
    themes: list[str] = []
    status: str = "active"
    is_closed: bool = False
    participant_count: Optional[int] = None
