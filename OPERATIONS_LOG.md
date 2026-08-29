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

### 2026-08-29 15:25 - Faculty review queue wired end to end

- **Restore ID:** `FE-20260829-1525`
- **Type:** Frontend source
- **Artifact:** `~/scoup-backups/frontend/src.before-reviewqueue.20260829-152058.tar.gz`
- **Files changed:** `src/components/admin/PendingApprovalsPage.tsx`, `src/utils/api.ts`,
  `src/components/admin/FacultyManagementPage.tsx`,
  `src/components/admin/AdminMessagesPage.tsx`,
  `src/components/admin/DepartmentManagementPage.tsx`

**The page called the right endpoints, but showed nothing worth deciding on.** Every one of the
126 pending records rendered as a bare name - no department, no title, no indication of why it
was pending - because the backend had cleared those fields when it demoted the records. The page
also described them as *"faculty who have verified their institutional email"*, which is not what
these are: they are SU-directory match candidates the importer refused to auto-verify.

**Contract mismatch, present across the whole admin dashboard.** `primary_department` was typed
as `{ id: number; name: string } | null`; the API has always returned a **plain string** (there
is no Department model with ids). Four pages read `.name` off a string:

| Page | Symptom |
| --- | --- |
| PendingApprovals | department badge silently never rendered |
| FacultyManagement | fell through to `departments[0]`, masking the bug |
| AdminMessages | same silent fallback |
| DepartmentManagement | built a real department group keyed **`undefined`** |

Fixed to `string` in all four, and `primary_school` added.

**The queue now shows its evidence.** Each card renders `review_evidence` from the API:

- a match-type badge - *First initial only*, *Ambiguous - multiple candidates*, *Not in the SU
  directory* - colour-coded by how much doubt it carries
- the plain-English reason, e.g. *the directory lists "Philip Anderson" but this record reads
  "P... Anderson"*
- the directory row that would be applied, with title, department and room resolved to a
  building (`HS230F - Henson Science Hall`)
- an expander listing every other directory row sharing the surname
- ORCID (linked), paper and citation counts, and the papers currently attributed to the record,
  so a reviewer can sanity-check the person against their publications
- filter chips by match type, so the 115 single-candidate records can be worked separately from
  the 11 genuinely ambiguous ones

**Two approve actions, deliberately distinct.** *Confirm match* posts
`apply_directory_match: true`, which writes the directory title, department, room, phone and
school onto the record and marks it directory-verified; *Approve only* approves without
asserting the directory identity. Records with no single candidate offer only plain approve, and
the backend independently returns 400 if the flag is sent anyway - the UI cannot talk it into a
guess.

- **Verification:** `npx tsc --noEmit` reports no new errors (the one remaining,
  `replaceAll` in FacultyManagementPage:236, is pre-existing - confirmed by re-running against a
  stashed tree). Endpoint behaviour verified against the backend by curl; see the
  2026-08-29 15:20 entry in the backend log.
- **Status:** In repo, not yet built or deployed.

### 2026-08-29 16:10 - Six sidebar pages wired to real data or honest empty states

- **Restore ID:** `FE-20260829-1610`
- **Type:** Frontend source
- **Artifact:** `~/scoup-backups/frontend/src.before-reviewqueue.20260829-152058.tar.gz`
- **Files added:** `src/components/SearchPage.tsx`, `src/components/NetworksPage.tsx`,
  `src/components/InstitutionsPage.tsx`, `src/components/FacilitiesPage.tsx`,
  `src/components/NoDataYetPage.tsx`
- **Files changed:** `src/App.tsx`, `src/utils/api.ts`

Closes backend open item #5. Four pages now carry real data; two are empty **because the data
is empty**, and say so rather than showing invented rows.

| Page | Source | What it shows |
| --- | --- | --- |
| Search | `GET /api/search/` | 30 ranked papers, confidence, matched fields, filters |
| Networks | `GET /api/network/discovery/` | 60 researchers across 24 departments / 5 schools |
| Institutions | `GET /api/institutions/` | 91 cleaned institutions with merge provenance |
| Facilities | `GET /api/facilities/` | 91 buildings, 162 faculty placed in 9 of them |
| Projects | - | honest empty state (Project table is empty) |
| Labs | - | honest empty state (no data source exists) |

**Search is not redundant with the home page search bar.** The home page calls
`performSearch()` in `src/utils/searchEngine.ts`, which ranks a dataset **downloaded into the
browser** from `/api/public/search-data/`. This page calls `/api/search/`, so it uses the
backend ranker over the full corpus and can filter by year, journal, citations and abstract
presence - constraints the client-side engine has no equivalent for. Each result shows the
ranker's confidence and which fields matched, so a surprising hit is explainable.

**Networks is not redundant with Experts.** Experts answers *who matches best* and returns a
ranked list of people. Networks answers *how work on this topic connects*: it clusters the same
discovery response by department, ranks the keywords bridging each cluster, flags papers that
span more than one department, and surfaces the query expansion the backend applied - so a
result set broader than the phrase typed is explainable rather than mysterious.

**`NoDataYetPage` is a new component, distinct from `ComingSoonPage`.** ComingSoon means "not
built yet". NoDataYet means "built, connected, and legitimately empty", and states what exists,
why it is empty, and what would fill it. Projects notes that the model exists but
`/api/projects/` is auth-scoped to a faculty member's own projects, so there is no public data;
Labs notes that no model, endpoint or dataset exists at all.

**Verification - rendered, not just compiled.** All six routes were loaded in headless Chromium
against a backend running on a **throwaway copy** of the database, and screenshotted:

| Check | Result |
| --- | --- |
| all six routes render with correct headings | pass |
| console errors / failed requests | none |
| Networks | 60 researchers, 24 departments, 5 schools, 60 papers |
| Facilities | 91 buildings, 105 codes, 9 occupied, 162 faculty placed |
| Institutions | 91 of 91 listed |
| Search with "machine learning" | 30 results, 100% confidence top hits, matched-field chips |
| Search with `year_min=2020` applied through the UI | filter chip shows (1), results all >= 2020 |

`npm run build` succeeds (2,323 modules). `npx tsc --noEmit` reports no errors in any new file;
the errors it does report are pre-existing (versioned import specifiers resolved by Vite
aliases, implicit `any` in `publicData.ts`, `replaceAll` lib target, `main.tsx` extension).

**Note on the dev-server check.** CORS in `scoupdb/settings.py` uses a hardcoded
`FRONTEND_ORIGINS` list with no environment override, so the verification server had to run on
port **3000** (already allowed). Settings were not modified for testing.

- **Status:** In repo, not yet built for deploy or deployed.

---

## Planned work

| # | Item | Status |
| --- | --- | --- |
| 1 | Port sidebar navigation from `~/scoup-frontend` schema | Done (2026-08-28 23:56) |
| 2 | Add sidebar sub-pages, preserving existing home page | Done (2026-08-29 16:10) |
| 3 | Wire category browsing to `/api/categories/` once backend returns real data | Done - Capabilities / Expertise Map |
| 4 | Remaining `ComingSoonPage` routes: Network Intelligence, Events, Verified Network, My Network | Not started - all sign-in gated |
| 5 | Bundle is 1.15 MB; needs code-splitting | Not started |
| 6 | `tsc` errors predating this work (versioned import specifiers, implicit `any`, `replaceAll` lib target) | Not started |
