# Architecture

How the choir web app is put together, and how it talks to the API. Operational setup is in the [README](../README.md). Step-by-step journeys are in [end-to-end.md](end-to-end.md).

## System

```mermaid
flowchart LR
  subgraph browser [Browser]
    Pages["React app<br/>HashRouter"]
  end

  subgraph host [Where it runs]
    GH["GitHub Pages<br/>static files"]
    Vite["Vite dev server<br/>:5173"]
  end

  API["Express API"]
  DB[("MongoDB")]

  GH --> Pages
  Vite --> Pages
  Pages -->|"Bearer JWT<br/>production"| API
  Pages -->|"/api proxy<br/>httpOnly cookies<br/>local"| API
  API --> DB
```

Locally the browser only talks to Vite. Vite forwards `/api` to `127.0.0.1:4000`, so the API can set cookies for `localhost`.

On GitHub Pages the files are static. `VITE_API_URL` is baked in at build time, and the browser calls Render directly with `Authorization: Bearer` and `X-Auth-Client: bearer`.

## Boot

```mermaid
flowchart TD
  HTML["index.html"] --> Main["main.jsx"]
  Main --> EB["ErrorBoundary"]
  EB --> HR["HashRouter"]
  HR --> Auth["AuthProvider"]
  Auth --> Me["GET /api/auth/me"]
  Auth --> App["App routes"]
  Me --> User["user or null"]
  User --> App
```

`AuthProvider` starts a backend warmup ping and loads the current user once. `ProtectedRoute` waits until that load finishes, then redirects.

## Route gates

```mermaid
flowchart TD
  Visit["Open a hash route"] --> Loading{"Auth still loading?"}
  Loading -->|yes| Spinner["Loading…"]
  Loading -->|no| Signed{"user set?"}
  Signed -->|no| Login["/login"]
  Signed -->|yes| Pw{"mustChangePassword?"}
  Pw -->|yes| Change["/change-password"]
  Pw -->|no| Kind{"Route is adminOnly?"}
  Kind -->|yes| IsAdmin{"role is admin?"}
  IsAdmin -->|yes| Admin["Admin screen"]
  IsAdmin -->|no| MemberHome["/attendance"]
  Kind -->|no| IsMember{"role is member?"}
  IsMember -->|yes| Member["Singer screen"]
  IsMember -->|no| Events["/admin/events"]
```

Public routes (`/login`, `/register`) are outside `ProtectedRoute`. `/change-password` is also outside it, and the page itself sends people who do not need a new password back to their home.

## Screen map

```mermaid
flowchart TB
  subgraph publicScreens [Public]
    Login
    Register
    ChangePassword
  end

  subgraph memberScreens [Singer]
    Attendance["My attendance"]
    Profile["My profile"]
    Help["Help and FAQs"]
    Account
  end

  subgraph adminScreens [Admin]
    Events
    Take["Take attendance"]
    Roster
    Manage
    Feedback["Member feedback page"]
    Faqs["FAQ editor"]
    AdminAccount["Account"]
  end

  Login --> Attendance
  Login --> Events
  Register --> Login
  Events --> Take
  Events --> Roster
  Roster --> Feedback
  Roster --> Manage
```

Admin navigation is five links in `AdminHome`: Events, Take attendance, Members, FAQs, Account. Members stays active on Roster, Manage, and a singer's feedback page because those URLs start with `/admin/members`.

## Page data flow

```mermaid
sequenceDiagram
  participant Page
  participant API as api.js
  participant Server

  Page->>API: api(path, options)
  alt Cookie mode
    API->>Server: fetch with credentials
  else Bearer mode
    API->>Server: Authorization Bearer
  end
  alt 401 and a refresh token exists
    Server-->>API: 401
    API->>Server: POST /api/auth/refresh
    API->>Server: retry the original request
  else 2xx
    Server-->>API: JSON
    API-->>Page: parsed body
  end
```

Pages do not read tokens themselves. `api.js` stores them only in Bearer mode.

List responses pass through `src/utils/api-data.js` before they are rendered, so a missing pagination block or an unmarked attendance status has one shape in the UI.

## Members page

One component, two URLs.

```mermaid
flowchart TD
  URL{"Path"}
  URL -->|"/admin/members"| Roster
  URL -->|"/admin/members/manage"| Pills

  Roster --> Filters["Search, event, voice, attendance, dates"]
  Roster --> Export["PDF or Excel"]
  Roster --> Feedback["Feedback dialog"]
  Roster --> Name["Name opens /profile"]

  Pills --> Members["Choir members<br/>search and Manage menu"]
  Pills --> Admins
  Pills --> Approvals
  Pills --> Extra["Inactive and Declined<br/>only when the list is not empty"]
```

Roster data is `GET /api/members/roster` with the filters on screen. The Manage member list is a second call to the same endpoint with only the search box, so an attendance filter on the roster does not hide someone you need to deactivate.

## Layout

```mermaid
flowchart TB
  subgraph wide [Wide screen]
    Top["Top bar with links"]
    Body["Page content scrolls with the document"]
  end

  subgraph phone [Max width 768px]
    Top2["Top bar, not fixed"]
    Scroll[".content scrolls"]
    Nav["Bottom bar in normal flow"]
    Top2 --> Scroll --> Nav
  end
```

Below 768px, `.data-table` is hidden and `.data-cards` is shown. Inputs use a 16px font so iOS does not zoom on focus.

## Build outputs

| Mode | `base` | API |
| --- | --- | --- |
| `npm run dev` | `/` | Proxy to port 4000, cookies |
| `npm run build` | `/` | Whatever `VITE_API_URL` was at build time |
| GitHub Actions | `/attendance-application/` | `VITE_API_URL` from the repository variable |

The production API origin is compiled into the bundle. Changing it requires a new Pages deploy.
