# St Paul's Malayalam Parish — Choir (web)

React frontend for the parish choir attendance app.

**Repo:** [St-Pauls-Malayalam-Parish/attendance-application](https://github.com/St-Pauls-Malayalam-Parish/attendance-application)

**Live site:** [https://st-pauls-malayalam-parish.github.io/attendance-application/](https://st-pauls-malayalam-parish.github.io/attendance-application/)

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

1. Open [Settings → Pages](https://github.com/St-Pauls-Malayalam-Parish/attendance-application/settings/pages)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. _(When API is hosted)_ Go to **Settings → Secrets and variables → Actions → Variables** and add:
   - Name: `VITE_API_URL`
   - Value: your API URL, e.g. `https://st-pauls-malayalam-choir-attendance.onrender.com`

### Git remote

```bash
git remote set-url origin https://github.com/St-Pauls-Malayalam-Parish/attendance-application.git
```

### Push updates

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Check the [Actions](https://github.com/St-Pauls-Malayalam-Parish/attendance-application/actions) tab for build status.

### Note on login

The UI deploys without the API. Sign-in works only after you host the backend and set:

- `VITE_API_URL` in GitHub Actions variables
- `CLIENT_ORIGIN=https://st-pauls-malayalam-parish.github.io` on the API
