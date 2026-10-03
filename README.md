# St Paul's Malayalam Parish — Choir (web)

React app for choir members and admins at St Paul's Malayalam Parish, Pune. Singers see their own attendance and profile. Admins run events, take attendance, manage accounts, and keep FAQs.

| Resource | URL |
| --- | --- |
| **This repo** | [attendance-application](https://github.com/St-Pauls-Malayalam-Parish/attendance-application) |
| **API** | [attendance-server](https://github.com/St-Pauls-Malayalam-Parish/attendance-server) |
| **Live app** | [GitHub Pages](https://st-pauls-malayalam-parish.github.io/attendance-application/) |
| **Author** | Rigin Oommen \<riginoommen@gmail.com\> |

## Documentation

| Document | What it covers |
| --- | --- |
| This README | Setup, screens, auth, build, and deploy |
| [docs/architecture.md](docs/architecture.md) | System, route, and data-flow diagrams |
| [docs/end-to-end.md](docs/end-to-end.md) | Sign-in, approval, attendance, export, and feedback from the screen to the API |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to change the app and open a pull request |
| [LICENSE](LICENSE) | Apache License 2.0 |

The API reference, data models, and Render deploy steps live in the server README.

## Requirements

- Node.js 20 or newer (GitHub Actions builds with Node 20)
- The API running locally on port 4000, or a hosted API URL

## Setup

From a checkout that has both repositories side by side:

```bash
cd client
npm install
cp .env.example .env   # optional; leave VITE_API_URL empty for local dev
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

In development, Vite proxies `/api` to `http://127.0.0.1:4000` (`vite.config.js`). Leave `VITE_API_URL` empty so the browser stays on the Vite origin and the API can use httpOnly cookies.

Start the API from the server repository first (`npm run mongo:up`, `npm run seed`, `npm run dev`). Local admin sign-in is `admin` / `choiradmin` until that password is changed.

## Environment

Copy `.env.example` to `.env`. Only variables prefixed with `VITE_` are exposed to the browser.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | empty | API origin for production builds, with no trailing slash. Example: `https://your-service.onrender.com` |

| Build flag | Where | Purpose |
| --- | --- | --- |
| `GITHUB_PAGES=true` | GitHub Actions only | Sets the Vite `base` to `/attendance-application/` so asset URLs match GitHub Pages |

An empty `VITE_API_URL` means cookie auth through the dev proxy. A set `VITE_API_URL` means Bearer tokens stored in `localStorage`, which is how GitHub Pages talks to Render.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173, with the `/api` proxy |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch mode |

## Stack

- React 19 and React Router 7, using `HashRouter` so GitHub Pages can serve every screen without server rewrites
- Vite 6
- Radix Alert Dialog for confirmations
- One stylesheet: `src/index.css`
- Vitest and jsdom for unit tests

There is no global state library. The signed-in user lives in `AuthContext`. Each page loads its own data through `src/api.js`.

## Screens

Routes are declared in `src/App.jsx`. Hashes look like `http://localhost:5173/#/admin/members`.

### Public

| Path | Screen | Who |
| --- | --- | --- |
| `/login` | Sign in with username and password | Everyone |
| `/register` | Create a pending singer account | Everyone |
| `/change-password` | Forced or voluntary password change | Signed-in user with `mustChangePassword` |

### Singer

Wrapped by `ProtectedRoute`. An admin who opens these paths is sent to `/admin/events`.

| Path | Screen |
| --- | --- |
| `/attendance` | My attendance: summary, filters, history, PDF or Excel export |
| `/my-profile` | Voice range, choir pathway, and feedback history (read only) |
| `/faqs` | Published help for members |
| `/account` | Signed-in name and change password |

### Admin

Wrapped by `ProtectedRoute` with `adminOnly`. A singer who opens these paths is sent to `/attendance`.

The bottom bar on a phone, and the top bar on a wider screen, has five items: Events, Attendance, Members, FAQs, Account.

| Path | Screen |
| --- | --- |
| `/admin/events` | Calendar or tile list, filters, create and edit events |
| `/admin/attendance` | Pick an event, then mark the roster |
| `/admin/attendance/:eventId` | Same screen, opened on one event |
| `/admin/members` | Roster: attendance, search, filters, export, Feedback |
| `/admin/members/manage` | Account admin: members, admins, approvals, inactive, declined |
| `/admin/members/:memberId/profile` | Voice range, pathway, and feedback history for one singer |
| `/admin/faqs` | Write and publish FAQs |
| `/admin/account` | Admin account and change password |

Unknown paths redirect to `/attendance`, which then sends an admin on to Events.

### Roster and Manage

Both views are the same page, `AdminMembers`. The URL decides which one is showing.

| | Roster | Manage |
| --- | --- | --- |
| Path | `/admin/members` | `/admin/members/manage` |
| Purpose | Who sings, and how often | Accounts: edit, deactivate, delete, approve |
| Row action | Feedback, and the name opens history | Manage menu: edit, deactivate or reactivate, delete |
| Add member | Hidden | Shown |
| Sections | One filtered roster | Pills: Members, Admins, Approvals, and Inactive or Declined when those lists have people |

Feedback is the musical record (voice range, pathway, notes). It stays on the roster. Account changes stay on Manage.

## How a request is made

`src/api.js` is the only HTTP client.

1. `usesBearerAuth` is true when `VITE_API_URL` is set.
2. Cookie mode sends `credentials: 'include'` and does not touch `localStorage`.
3. Bearer mode sends `Authorization` and `X-Auth-Client: bearer`, and stores `choir_auth_token` plus `choir_refresh_token`.
4. A 401 refreshes once. Concurrent 401s share one refresh call.
5. If refresh fails, tokens are cleared and the hash becomes `#/login?session=expired`.

`AuthProvider` calls `GET /api/auth/me` on load. While that request is in flight, protected routes show “Loading…”.

`ProtectedRoute` then applies three gates, in order: signed in, password already changed, and the correct role for the route.

## Project structure

```
client/
├── .github/workflows/deploy.yml   # GitHub Pages
├── docs/
│   ├── architecture.md
│   └── end-to-end.md
├── src/
│   ├── main.jsx                   # HashRouter, AuthProvider, ErrorBoundary
│   ├── App.jsx                    # Routes
│   ├── api.js                     # fetch, cookies or Bearer, refresh
│   ├── AuthContext.jsx
│   ├── index.css
│   ├── pages/                     # One screen per route
│   ├── components/                # Dialogs, cards, filters, shell
│   ├── hooks/
│   ├── nav/memberLinks.js
│   └── utils/                     # Filters, export columns, API normalizers
├── tests/                         # Vitest
├── index.html
├── vite.config.js
├── CONTRIBUTING.md
├── LICENSE
├── NOTICE
└── package.json
```

### Pages and the components they lean on

| Page | Main pieces |
| --- | --- |
| `Login`, `Register`, `ChangePassword` | `AuthLayout` |
| `MemberHome` | `DateRangeFilters`, `AttendanceHistoryCard`, `RosterExportDialog` |
| `MemberProfile` | `MemberProfileDisplay` |
| `AdminEvents` | `EventCalendar`, `EventCard`, `EventFormModal`, `FilterPanel` |
| `AdminAttendance` | `AttendanceRosterCard`, `AttendanceStatusFields` |
| `AdminMembers` | `ViewToggle`, `MemberCard`, `MemberTableActions`, `MemberFormModal`, `MemberProfileModal` |
| `AdminMemberProfile` | `MemberProfileEditor` |
| `AdminFaqs`, `MemberFaqs` | `FaqAccordion`, `FaqFormModal` |
| `Account` | `ChangePasswordForm`, `Shell` |

`Shell` draws the top bar and the five-item bottom bar. On a phone the page is a column: top bar, scrolling content, bottom bar in normal flow so the last row is not covered.

Tables become cards below 768px. A list that is only a `<table>` is invisible on a phone, so each list also has a `.data-cards` block.

## Attendance in the UI

Statuses are `present`, `absent`, `late`, and `excused`. A row that has not been saved yet stays unmarked (`status: ""`) until the admin saves. Saving an unmarked row records it as absent.

The rate shown on the roster is:

```
round((present + late) / (present + absent + late) × 100)
```

Excused absences are counted in the detail line and left out of the percentage.

Exports:

| Screen | Formats | Columns |
| --- | --- | --- |
| Roster | PDF, Excel | Name, username, email, voice, range, pathway, role, and either the rate or the status at the selected event |
| My attendance | PDF, Excel | Date, event, type, liturgical color, status, notes |

The dialog sends the current filters. The file is the full result, not only the page on screen. Column choices live in `src/utils/roster-export-fields.js` and `src/utils/attendance-export-fields.js`.

## Deploy to GitHub Pages

Pushes to `main` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### One-time setup

1. Settings → Pages → Source: **GitHub Actions**
2. Settings → Secrets and variables → Actions → Variables:
   - Name: `VITE_API_URL`
   - Value: the Render API origin, with no trailing slash

On the API, set `CLIENT_ORIGIN` to `https://st-pauls-malayalam-parish.github.io`.

The live site cannot sign in until both of those are set. The Pages build still succeeds without the variable; the app then has no API to call.

### What the workflow does

1. `npm ci`
2. `npm run build` with `GITHUB_PAGES=true` and `VITE_API_URL`
3. Upload `dist/` and deploy it to the `github-pages` environment

`HashRouter` keeps routes in the hash (`#/admin/members`), so a refresh on any screen still loads `index.html`.

## Testing

```bash
npm test
```

Tests cover API normalizers, attendance status display, filter helpers, and export field rules. They do not start a browser or the API. See [CONTRIBUTING.md](CONTRIBUTING.md) for where to add a test when you change those helpers.

## Troubleshooting

| What you see | What to check |
| --- | --- |
| Sign-in form, then a jump to Events | Session restore is still running, or you are already an admin |
| “Waiting for approval” after register | An admin still has to approve the account |
| Password screen on every visit | `mustChangePassword` is still true; finish the change-password form |
| Network error only on the live site | `VITE_API_URL` in the Actions variable, and a rebuild after changing it |
| CORS error on the live site | API `CLIENT_ORIGIN` is exactly `https://st-pauls-malayalam-parish.github.io` |
| Session expired right after login | Clear `choir_auth_token` and `choir_refresh_token` in localStorage and sign in again |
| API calls hit the wrong host locally | `VITE_API_URL` should be empty so the Vite proxy is used |
| A phone screen shows a heading and no people | That list is a table without a `.data-cards` block |
| Bottom menu sits under Safari or Chrome toolbar | Hard-refresh after deploy. Mobile shell uses `100svh` plus a small overlay inset |

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
