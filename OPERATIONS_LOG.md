# SCOUP Frontend 2.0 — Operations & Rollback Log

Record of frontend changes for `/home/rellis/scoup-frontend-2.0`, deployed to
`/var/www/scoup2025.privatedns.org/dist`.

Backend, database, and server changes are logged in `~/scoup-backend/OPERATIONS_LOG.md`.

## How to use this log

Every entry has a **Restore ID**. To recover, find the last good entry and follow its
restore command.

Restore ID formats:

| Prefix | Meaning | Location |
| --- | --- | --- |
| `FE-*` | Source snapshot of `src/` before an edit | `~/scoup-backups/frontend/` |
| `SITE-*` | Full site backup from the deploy manager | `/var/www/scoup2025.privatedns.org/_backups/` |
| `NONE` | No artifact required | |

Rollback of a deployed build: `~/scoupsite-pushv4.sh` → option `4` (Rollback to backup).

## Design constraints (do not violate)

- The **home page design, colors, theme, and layout must not change.**
- Work is limited to **adding sidebar navigation and its associated pages**, matching the
  schema defined in `~/scoup-frontend`.
- `~/scoup-frontend` is the **schema reference only**. `~/scoup-frontend-2.0` is the build
  that ships.

## Deploy procedure

```bash
cd ~/scoup-frontend-2.0
npm run build
sudo ~/scoupsite-pushv4.sh      # option 1 (deploy, auto-backup)
```

---

## Entries

### 2026-08-28 — Log initialized

- **Restore ID:** `NONE`
- **Type:** Documentation
- **Description:** Created this log. No frontend source or build changes made yet.
- **Reference:** Sidebar navigation port from `~/scoup-frontend` is planned but not started.

### 2026-08-28 23:56 - Sidebar navigation added

- **Restore ID:** `FE-20260828-2356`
- **Type:** Frontend source
- **Artifact:** `~/scoup-backups/App.tsx.before-nav.*`
- **Files added:** `src/components/Sidebar.tsx`, `src/components/AppShell.tsx`,
  `src/components/ExpertsPage.tsx`, `src/components/ComingSoonPage.tsx`
- **File changed:** `src/App.tsx` (route registration only)

**Home page untouched.** `/` still renders `Home` exactly as before; the sidebar only wraps the
new routes via `AppShell`, so colors, theme and the landing design are unchanged.

**Sidebar structure** (mirrors the Interlora reference screenshots):

- **Discover:** Search, Expertise Map, Networks, Experts, Capabilities, Projects, Labs,
  Facilities, Institutions
- **Members - Sign in:** Network Intelligence, Events, Verified Network, My Network, Admin
  (lock icons; routed to `/faculty-login` while signed out)
- Footer: live status with expert count from `/api/public/search-data/`, institution scope,
  and a sign-in button

**Experts page is real, not a mock.** It calls `/api/network/discovery/`, debounces the query at
400 ms, and renders match score, `matchReason`, shared keywords, paper/citation counts, and a
"Directory verified" badge driven by `directoryVerified`.

**Remaining destinations render `ComingSoonPage`,** which states plainly that the page has no
backend yet and names the planned endpoint - deliberately not faked with placeholder data.

**Build status:** Vite transformed all 2,317 modules successfully. The build then failed on
`EACCES ... dist/assets` because `dist/assets` is owned by `root` from an earlier sudo build.
Fix before rebuilding:

```bash
sudo chown -R rellis:rellis /home/rellis/scoup-frontend-2.0/dist
npm run build
```

`npx tsc --noEmit` reports no errors in any of the new files; the errors it does report are
pre-existing (versioned import specifiers resolved by Vite aliases, implicit `any` in
`publicData.ts`).

- **Status:** In repo, not yet built or deployed.

---

## Planned work

| # | Item | Status |
| --- | --- | --- |
| 1 | Port sidebar navigation from `~/scoup-frontend` schema | Not started |
| 2 | Add sidebar sub-pages, preserving existing home page | Not started |
| 3 | Wire category browsing to `/api/categories/` once backend returns real data | Blocked on backend |
