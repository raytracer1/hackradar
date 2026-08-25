from abc import ABC, abstractmethod
from models import HackathonItem


class BasePlugin(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique name for this source (e.g. 'devpost', 'mlh')."""
        ...

    @abstractmethod
    async def fetch(self) -> list[HackathonItem]:
        """Scrape hackathons from the source and return normalized items."""
        ...

    def __repr__(self) -> str:
        return f"<Plugin: {self.name}>"

    @staticmethod
    def parse_count(value) -> int | None:
        """Parse a participant/registrant count into an int, or None when
        absent, invalid, or non-positive (no data -> stat hidden)."""
        if value is None or isinstance(value, bool):
            return None
        if isinstance(value, (int, float)):
            n = int(value)
            return n if n > 0 else None
        try:
            n = int(float(str(value).replace(",", "").strip()))
            return n if n > 0 else None
        except (ValueError, TypeError):
            return None
