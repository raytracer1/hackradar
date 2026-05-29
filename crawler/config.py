import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
API_KEY = os.getenv("CRAWLER_API_KEY", "changeme-secret-key")
CRAWL_INTERVAL_SECONDS = int(os.getenv("CRAWL_INTERVAL", str(3 * 3600)))  # 3 hours
USER_AGENT = "HackRadarBot/1.0 (+https://github.com/hackradar)"
REQUEST_TIMEOUT = 30
