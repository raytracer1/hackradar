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
