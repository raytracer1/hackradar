import os
from pathlib import Path

# Load .env file if it exists
_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

# API endpoint
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
CRAWLER_API_KEY = os.getenv("CRAWLER_API_KEY", "changeme-secret-key")

CRAWL_INTERVAL_SECONDS = int(os.getenv("CRAWL_INTERVAL", str(3 * 3600)))
USER_AGENT = "HackRadarBot/1.0 (+https://github.com/hackradar)"
REQUEST_TIMEOUT = 30
