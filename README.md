# HackRadar

**Discover cash prize hackathons — all in one place.**

🌐 Live: [hackradar.win](https://hackradar.win) · 📖 [Blog](https://hackradar.win/blog) · 📡 [RSS](https://hackradar.win/rss.xml)

HackRadar aggregates upcoming hackathons with **real money prizes** from 12 platforms into a single filterable feed. No swag-only events, no "exposure" prizes — just competitions that pay.

## Features

- **Cash prizes only** — every listing is checked for a non-zero cash prize pool
- **Filter & search** — prize range (min/max), deadline & prize sorting, free-text search, per-platform toggles
- **Known system** — mark hackathons you've seen; they stay out of the main feed (stored in `localStorage`)
- **Auto-updating** — the crawler refreshes all sources around the clock; ended hackathons disappear automatically
- **Platform pages** — per-platform feeds at [`/platforms/devpost`](https://hackradar.win/platforms/devpost), [`/platforms/mlh`](https://hackradar.win/platforms/mlh), …
- **SEO-ready** — server-rendered pages, per-page metadata & JSON-LD structured data, sitemap, RSS, IndexNow pings on every data refresh

## Platforms

Devpost · MLH · HackerEarth · Devfolio · Kaggle · DoraHacks · LabLab.ai · Luma · HackQuest · Taikai · 0G Arena · SinCE.AI

## Architecture

```
┌─────────────┐   uploads JSON   ┌──────────┐   reads at render   ┌──────────────┐
│   crawler   │ ───────────────▶ │  R2 data │ ◀────────────────── │  Next.js app │
│  (Python)   │                  │  bucket  │                     │ (OpenNext on │
└─────────────┘                  └──────────┘                     │ CF Workers)  │
       │ POST /api/internal/revalidate (deletes ISR cache entries) └──────────────┘
       └──────────────────────────────────────────────────────▶ + IndexNow ping
```

### `crawler/` — Python

- Async crawler (`httpx` + `bs4`), one plugin per platform in [`crawler/plugins/`](crawler/plugins/)
- Each cycle: scrape all sources → dedupe → cash-prize filter → upload JSON chunks + a lightweight list file to R2 → notify the frontend to revalidate
- Runs on a schedule: `python main.py --loop` (interval via `CRAWL_INTERVAL`, default 6h)

### `front/` — Next.js 16

- App Router, deployed to **Cloudflare Workers** via [OpenNext](https://opennext.js.org/cloudflare)
- Homepage + platform pages + data-driven blog are ISR pages cached in R2 (24h safety net); the crawler's revalidate notification deletes the cache entries right after each upload
- Hackathon details are fetched on demand from `/api/hackathons/[id]`
- [`src/app/sitemap.ts`](front/src/app/sitemap.ts), [`src/app/rss.xml/route.ts`](front/src/app/rss.xml/route.ts), IndexNow key file in [`front/public/`](front/public/)

## Getting started

### Crawler

```bash
cd crawler
pip install -r requirements.txt
cp .env.example .env   # fill in R2_ENDPOINT / R2_ACCESS_KEY / R2_SECRET_KEY / CRAWLER_API_KEY
python main.py         # run once, or --loop for continuous mode
```

### Frontend

```bash
cd front
npm install
npm run dev            # local dev (needs R2_* env vars for data)
```

Deploy:

```bash
cd front
npx opennextjs-cloudflare build
wrangler deploy
```

## Links

- 🌐 Website: https://hackradar.win
- 🐦 X: [@BJ_Zheng](https://x.com/BJ_Zheng)
- ✉️ Contact: hello@hackradar.win

Found a missing hackathon or want a new platform? [Open an issue](https://github.com/raytracer1/hackradar/issues) or submit a PR — the crawler plugins are intentionally small and easy to extend.
