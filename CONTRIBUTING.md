# Contributing to the choir web app

This repository is the React client. The API is [attendance-server](https://github.com/St-Pauls-Malayalam-Parish/attendance-server). A local checkout usually has both folders next to each other.

The project is licensed under the Apache License 2.0. By submitting a change you agree that your contribution is licensed under the same terms. See [LICENSE](LICENSE).

## What to read first

| Document | Use it when |
| --- | --- |
| [README.md](README.md) | You need to run the app |
| [docs/architecture.md](docs/architecture.md) | You need to see how a screen reaches the API |
| [docs/end-to-end.md](docs/end-to-end.md) | You are changing a full user journey |
| Server README | You are changing a request body, status code, or auth rule |

## Setup

```bash
cd client
npm install
npm run dev
```

Leave `VITE_API_URL` empty. Start the API from the server folder so `http://127.0.0.1:4000` is up before you exercise a signed-in screen.

Do not commit `.env`. Do not put parish passwords, tokens, or a hosted MongoDB URI in a pull request.

## Making a change

1. Branch from `main`.
2. Keep the change small enough to review on its own.
3. Match the surrounding code: function components, one page per route, shared pieces in `src/components` or `src/utils`.
4. Call the API only through `src/api.js`.
5. If the list is a table, add the matching card markup so it still shows below 768px.
6. Run `npm test` and `npm run build`.

### Commit messages

Use a conventional commit:

```
feat: add event filter to member history export
fix: keep unmarked attendance rows unmarked until save
docs: describe the manage pills
```

Prefer `feat`, `fix`, `docs`, `refactor`, `test`, or `chore`. The subject should say why the change exists.

### Pull requests

- Describe what a singer or admin can do differently.
- List the screens you clicked, including a phone-width pass when layout or navigation changed.
- Mention the API change if the server repository has to ship at the same time.
- Do not include generated `dist/` output.

## Where code goes

| Kind of change | Where |
| --- | --- |
| New URL | `src/App.jsx`, and a nav item in `AdminHome` or `nav/memberLinks.js` |
| New screen | `src/pages/` |
| Dialog, card, filter, shell | `src/components/` |
| Request or token behaviour | `src/api.js` |
| Shape of an API payload before the page reads it | `src/utils/api-data.js`, with a test |
| Export columns | `src/utils/roster-export-fields.js` or `attendance-export-fields.js` |
| Visual rules | `src/index.css` |

The bottom bar stays at five items. A second view inside a page uses `ViewToggle` (Roster and Manage, Calendar and Tiles, the Manage section pills).

## Tests

```bash
npm test
```

Add a unit test when you change a normalizer, filter helper, status label, or export field rule. Page flows are still checked by using the running app.

## UI checks before you open the pull request

- Sign in as admin and as a member if both roles can see the change.
- Open the empty state (no rows, no pending approvals, no search matches).
- On a layout change, look at a desktop width and a width under 768px.
- Confirm the bottom bar does not cover the last action on the page.

## License

Apache License 2.0. See [LICENSE](LICENSE).
