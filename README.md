# St Paul's Malayalam Parish — Choir (web)

React frontend for the parish choir attendance app.

**Live site:** [https://riginoommen.github.io/st-pauls-malayalam-choir-pune/](https://riginoommen.github.io/st-pauls-malayalam-choir-pune/)

## Requirements

- Node.js 18+
- API server running locally or hosted (set `VITE_API_URL` for production)

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

## Deploy to GitHub Pages

This repo deploys automatically on every push to `main` via [GitHub Actions](.github/workflows/deploy.yml).

### One-time setup (GitHub)

1. Open [repo Settings → Pages](https://github.com/riginoommen/st-pauls-malayalam-choir-pune/settings/pages)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. _(Optional, when API is hosted)_ Go to **Settings → Secrets and variables → Actions → Variables** and add:
   - Name: `VITE_API_URL`
   - Value: your API URL, e.g. `https://your-api.onrender.com`

### Push updates

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Check the **Actions** tab for build status. The site will be at:

**https://riginoommen.github.io/st-pauls-malayalam-choir-pune/**

### Note on login

The UI deploys without the API. Sign-in works only after you host the backend and set `VITE_API_URL` + `CLIENT_ORIGIN` on the API to match the GitHub Pages URL.
