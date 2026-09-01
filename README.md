# St Paul's Malayalam Parish — Choir (web)

React frontend for the parish choir attendance app.

## Requirements

- Node.js 18+
- [choir-server](https://github.com/your-org/choir-server) running locally (or set `VITE_API_URL`)

## Setup

```bash
npm install
cp .env.example .env   # optional
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

In development, `/api` requests are proxied to `http://127.0.0.1:4000` (see `vite.config.js`).

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | _(empty)_ | API origin for production builds, e.g. `https://api.example.com` |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

## Deploy

Build with the API URL set:

```bash
VITE_API_URL=https://your-api-host npm run build
```

Serve the `dist/` folder with any static host. Ensure `CLIENT_ORIGIN` on the API matches your frontend URL (for cookies/CORS).
