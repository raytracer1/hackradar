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

# R2 S3 credentials
R2_ENDPOINT = os.getenv("R2_ENDPOINT", "")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY", "")
R2_BUCKET = os.getenv("R2_BUCKET", "hackradar-data")

CRAWL_INTERVAL_SECONDS = int(os.getenv("CRAWL_INTERVAL", str(6 * 3600)))

# Frontend notification (cache revalidation after each successful upload)
FRONT_BASE_URL = os.getenv("FRONT_BASE_URL", "https://hackradar.win").rstrip("/")
# Must match the frontend worker's CRAWLER_API_KEY secret
CRAWLER_API_KEY = os.getenv("CRAWLER_API_KEY", "")
USER_AGENT = "HackRadarBot/1.0 (+https://github.com/hackradar)"
REQUEST_TIMEOUT = 30
