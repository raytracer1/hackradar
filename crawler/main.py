#!/usr/bin/env python3
"""
HackRadar Crawler — Aggregates hackathon data from multiple sources.

Usage:
  python main.py              # Run once then exit
  python main.py --loop       # Run continuously every N seconds (configurable)
  python main.py --interval 3600  # Run once with custom interval in --loop mode
"""

import asyncio
import logging
import sys
import os

# Ensure crawler dir is on path for imports
sys.path.insert(0, os.path.dirname(__file__))

from plugins.devpost import DevpostPlugin
from plugins.dorahacks import DorahacksPlugin
from plugins.taikai import TaikaiPlugin
from plugins.lablab import LablabPlugin
from scheduler import Scheduler
from config import CRAWL_INTERVAL_SECONDS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("hackradar-crawler")


def get_plugins():
    return [
        DevpostPlugin(),
        DorahacksPlugin(),
        TaikaiPlugin(),
        LablabPlugin(),
    ]


async def main():
    loop_mode = "--loop" in sys.argv

    # Parse optional --interval flag
    interval = CRAWL_INTERVAL_SECONDS
    if "--interval" in sys.argv:
        try:
            idx = sys.argv.index("--interval")
            interval = int(sys.argv[idx + 1])
        except (ValueError, IndexError):
            pass

    plugins = get_plugins()
    logger.info(f"Loaded {len(plugins)} plugins: {[p.name for p in plugins]}")

    scheduler = Scheduler(plugins, interval=interval)

    if loop_mode:
        await scheduler.run_forever()
    else:
        await scheduler.run_once()


if __name__ == "__main__":
    asyncio.run(main())
