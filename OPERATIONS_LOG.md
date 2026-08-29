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

### 2026-08-29 16:40 - GOTCHA: `src/index.css` is precompiled; unknown Tailwind classes are inert

- **Restore ID:** `FE-20260829-1640`
- **Type:** Frontend source
- **Files changed:** the six components added/rewritten earlier today

**Read this before writing any Tailwind class in this repo.**

`src/index.css` is a **static, pre-generated Tailwind v4 stylesheet** (3,496 lines, header
`/*! tailwindcss v4.1.3 */`). `package.json` has **no `tailwindcss` dependency**, there is **no
`postcss.config.*`**, and `vite.config.ts` adds no CSS plugin - so **nothing regenerates it.**
A class that is not already in that file produces no CSS and silently does nothing. There is no
error, no warning, and the build succeeds.

**This caused a real defect.** The review queue's active filter chip used
`bg-gray-900 text-white`. `bg-gray-900` is not in the stylesheet, so the chip rendered **white
text on a transparent background - invisible**. Confirmed by computed style:

```terminal
ALL chip: { background: "rgba(0, 0, 0, 0)", color: "rgb(255, 255, 255)" }
```

**Notable absences** found while auditing (this is not the full list):

| Missing | Present instead |
| --- | --- |
| `bg-gray-700/800/900`, `border-gray-900` | only `bg-gray-50/100/200/300` |
| **all `sm:` grid variants** | `md:grid-cols-1..5` |
| every `amber` shade | use the brand `#ffd100` / `#8b0000` |
| `pl-9`, `pr-3`, `max-w-xl` | `pl-10`, `px-3`, `max-w-2xl` |
| `text-[11px]`, `text-[10px]` | `text-xs` |
| `h-3.5`, `w-3.5`, `mb-1.5`, `h-1.5` | `h-3`, `w-3`, `mb-1`, `h-2` |
| `opacity-50` | `opacity-75` |
| `tabular-nums`, `leading-snug`, `italic`, `font-mono` | no equivalent - omit |
| opacity-modified arbitrary values (`bg-[#8b0000]/60`) | the unmodified `bg-[#8b0000]` |

**Fixed in the six components from today's work.** Every class was audited against the
stylesheet and the ~50 missing ones replaced with verified-present equivalents; decorative
classes with no equivalent were removed rather than left dead. Re-verified in headless Chromium:
the active chip is now `rgb(139, 0, 0)` with white text, and the stat-tile grids render four
across.

**Pre-existing, not introduced here.** `ExpertsPage.tsx` (shipped 2026-08-28) uses `pl-9`,
`max-w-xl` and `focus:ring-[#8b0000]/30`, all inert. The new pages copied that input pattern,
which is how the issue surfaced. ExpertsPage was left unchanged - it is a separate, already-
deployed file - but it is degraded in the same way and is listed under planned work.

**How to check before committing:** grep the stylesheet for the escaped selector. Tailwind
escapes `[ ] # / . :` in generated class names:

```bash
grep -cF '.bg-gray-900' src/index.css        # 0 -> the class does nothing
grep -cF '.text-\[11px\]' src/index.css      # 0 -> use text-xs
```

The proper fix is to add `tailwindcss` as a real build dependency so classes are generated from
source. That would regenerate the whole stylesheet and risks changing the home page, which this
log forbids, so it is recorded as planned work rather than done here.

- **Status:** In repo, built successfully, not deployed.

### 2026-08-29 18:35 - Public faculty profile page, and faculty names made linkable

- **Restore ID:** `FE-20260829-1835`
- **Type:** Frontend source
- **Artifact:** `~/scoup-backups/frontend/src.before-facultyprofile.20260829-180203.tar.gz`
- **Files added:** `src/components/FacultyProfilePage.tsx`, `src/components/FacultyLink.tsx`
- **Files changed:** `src/App.tsx`, `src/utils/api.ts`, `src/components/ExpertsPage.tsx`,
  `src/components/NetworksPage.tsx`, `src/components/CapabilitiesPage.tsx`,
  `src/components/BrowseCategories.tsx`

`GET /api/faculty/<pk>/public/` has been deployed since the backend added
`academic/public_profile_views.py`, but **no page in the frontend called it and no link
anywhere pointed at a person.** Faculty names rendered as dead text on every page that listed
them. This adds the page and the links.

**New route `/faculty/<id>`,** registered in the `default:` branch of the hand-rolled router in
`App.tsx` next to the existing `/browse/<slug>` prefix match. It renders inside `AppShell`
rather than the `Navbar`/`Footer` chrome: the profile is a Discover artifact, and the sidebar it
inherits contains Experts, Networks and Capabilities - the three pages people arrive from. The
trade-off is that arriving from `/browse` swaps the public navbar for the sidebar.

**What the page shows** - header (photo or initials, name, directory-verified badge, title,
department, school, bio), a three-tile metric row, a contact card, research topics, and the
paper list.

| Detail | Decision |
| --- | --- |
| Phone | Every one of the 150 populated `phone` values is a **5-digit campus extension**, not a dialable number. Labelled "Campus extension" and **not** wrapped in a `tel:` link - constructing a full number would be a guess. |
| Email | Not shown. The endpoint withholds it deliberately; introductions run through the existing throttled inquiry flow. |
| Research topics | `expertise` is `[]` on essentially every record; `keywords` is the populated field. The page prefers `expertise` and falls back to `keywords`, rather than rendering an empty section. |
| Paper links | `url` first, then `https://doi.org/<doi>`, then plain text. |
| Paper count line | Says "31 papers, most cited first" when the list is complete and "Showing the 50 most cited of N" when the endpoint's cap of 50 truncates it, so the cap is never silently hidden. |

**Three distinct failure states, because they are three different facts.**

| Condition | Renders |
| --- | --- |
| 404 from the endpoint | *Profile not available* - explains that visibility is the faculty member's choice and that records awaiting review are hidden, so absence is not evidence the person is missing |
| Non-numeric id (`/faculty/not-a-number`) | *That is not a profile address* - the id is malformed, which is not the same as a hidden profile, and saying "not published" there would be untrue |
| Any other error | *Could not load this profile* with the message, explicitly labelled a request failure |

Telling 404 apart from a transport error needed a status code, which `apiCall` was discarding.
`rawApiCall` in `src/utils/api.ts` now attaches `error.status = res.status` before throwing.
This is additive - the existing 401-refresh path still matches on the message and is unaffected.

**Faculty names are now links in five places,** via a new shared `FacultyLink` component. It
renders a real `<a href="/faculty/<id>">` so the URL is visible on hover, copyable and
openable in a new tab; modified clicks (ctrl/cmd/shift/alt/middle) are left to the browser and
only a plain left click is intercepted for client-side navigation. It also `stopPropagation()`s,
so clicking a name inside a card that has its own `onClick` navigates instead of filtering.

| Page | What became a link |
| --- | --- |
| Experts | expert name on each card (40 links) |
| Networks | member names in each department cluster (56 links) |
| Capabilities / Expertise Map | "Experts behind this capability" names (11 on Computer science) |
| Browse - Faculty tab | faculty name **and** a "View profile" action on each card |
| Browse - drill-down card | "View full profile", placed after the department line |
| Browse - paper cards | author names |

**Paper author names are linked selectively, not blindly.** `paper.authors` from
`/api/categories/<slug>/` carries a real `Faculty.pk` for every author, but that list includes
external co-authors who are not in `_visible_faculty_qs()` and would 404. Only authors that the
same category response already lists in its visibility-filtered `faculty[]` array are linked;
everyone else stays plain text. 116 author links render on `computer-science`, and none of them
is a guess. For the same reason `FacultyLink` renders plain text whenever the id is not numeric
or no navigate handler was passed - it can never produce a link that goes nowhere.

**Home-page search was deliberately left alone.** `SearchResults.tsx` / `FacultySlideOver.tsx`
are driven by `/api/public/search-data/`, whose faculty `id` is `str(item.faculty_id)` - the
`SU-DIR-acocella-c` style slug, **not** the primary key the profile endpoint needs. Linking it
would require adding the pk to that payload, which is a backend change and a deploy; per this
session's instructions the live deployment was not touched. Recorded as planned work #10.
(`FacultyLink` would degrade those ids to plain text safely, so wiring it there today would
produce nothing but dead weight.)

**Stylesheet discipline.** Every class in both new files was checked against `src/index.css`
before committing, using the escaped-selector method from the 2026-08-29 16:40 entry - both
files come back clean. `hover:bg-[#6f0000]` was written first and caught as inert (no darker
brand red exists in the stylesheet at all); the filled buttons use `hover:shadow-md
transition-shadow` instead. A before/after diff of the class audit on `BrowseCategories.tsx`
confirms **no new dead classes were introduced** - the ones it reports (`border-l-4`,
`h-3.5`, `mb-1.5`, `lg:grid-cols-[280px_1fr]` and others) all predate this work.

**Verification - rendered against the live API, not mocked.** `dist/` was served on port 4173
by a local static server with SPA fallback that reverse-proxies `/api/*` to
`https://scoup-salisbury.net`. Because the bundle is built with `VITE_API_BASE_URL=/api`, API
calls are same-origin - this reproduces production exactly and avoids CORS entirely, so
`scoupdb/settings.py` did not have to be touched. Driven with Playwright over the system
Chromium at `/usr/bin/chromium-browser` (the bundled browser needs Node 20; this box has 18).

| Check | Result |
| --- | --- |
| `/faculty/405` direct load | "Enyue Lu", Professor - Computer Science, Henson School; Papers 31 / Citations 119 / Avg 3.84 - matching the API byte for byte |
| Verified badge computed style | `oklch(0.982 0.018 155.826)` on `oklch(0.527 0.154 150.069)` - green on green, not the invisible-chip failure mode |
| Papers rendered | 31 items, 31 DOI links, correct order (27, 18, 16, 9, ... cited) |
| ORCID link | `https://orcid.org/0009-0008-7283-4617` |
| Experts -> name -> profile -> Back | `/experts` -> `/faculty/681` (Chao Miao) -> back to `/experts` |
| Networks -> name -> profile | `/faculty/681`, heading matches |
| Capabilities -> Computer science -> expert | 11 links, `/faculty/708` (Asif Shakur) |
| Browse -> Faculty tab -> profile | 22 links (11 names + 11 "View profile"), lands on `/faculty/708` |
| Browse -> drill-down -> View full profile | lands on `/faculty/708` |
| Browse -> paper author link | 116 author links; clicking "Enyue Lu" lands on `/faculty/405` |
| `/faculty/999999` | *Profile not available* (the 404 is the endpoint's, and is expected) |
| `/faculty/not-a-number` | *That is not a profile address*, with no request sent |
| Smoke test, 14 routes | all render their correct `h1`; **zero** console errors and zero failed requests everywhere except `/docs` (see open items) |

`npm run build` succeeds (2,327 modules, `index-*.js` 1.15 MB). Built with
`env -u VITE_API_BASE_URL` and the bundle re-checked for `onrender` (0 occurrences) per the
backend log's `INCIDENT-20260829-1749`. `npx tsc --noEmit` reports **no new errors**; the one
it flags in `BrowseCategories.tsx` is pre-existing, confirmed by re-running against a stashed
tree (it simply moved from line 842 to 875).

**Two things found while working, neither introduced here.**

1. `CapabilitiesPage.tsx` carries the same inert classes as `ExpertsPage.tsx`
   (`pl-9`, `pr-3`, `max-w-xl`, `text-[11px]`, `mt-5`, `lg:grid-cols-3`,
   `focus:ring-[#8b0000]/30`, `hover:border-[#8b0000]/40`). It was not among the six files
   audited on 2026-08-29 16:40. Left unchanged - repairing already-shipped pages is separate
   work, not part of this task - and folded into planned work #8.
2. `/docs` requests `GET /api/contact/settings/`, which **does not exist on the backend**
   (`curl` against the live site returns 404, and there is no such route in `academic/urls.py`).
   Harmless today, but it is a real 404 on every page load.

**Note on repo state.** Commits `f441e78`, `e54b455` and `2d93a23` were made in this repository
by another actor while this work was in progress; `f441e78` swept up the in-progress
`src/utils/api.ts` edits from this task. Nothing was lost, but this branch was not exclusively
held during the change.

- **Status:** In repo, built successfully, **not deployed** - `/var/www` was left untouched by
  instruction.

### 2026-08-29 18:50 - Home-page faculty results now link to real profiles

- **Files changed:** `src/data/searchData.ts`, `src/utils/datasetNormalization.ts`,
  `src/utils/searchEngine.ts`, `src/components/SearchResults.tsx`,
  `src/components/FacultySlideOver.tsx`

Closes planned work #10. The backend now returns a numeric `profileId` alongside the
`SU-DIR-...` slug on every faculty item in `/api/public/search-data/` (backend commit
`ac37ffc`), which is the id `/faculty/:id` and `/api/faculty/<id>/public/` take.

`FacultyMember` gained `profileId?: number`; `normalizeFacultyRecord` accepts it only when it
is a positive integer, so a malformed payload degrades to plain text rather than a dead link -
the same guarantee `FacultyLink` already makes. No new link component was written; the existing
`FacultyLink` from the 18:35 entry is reused in both places.

| Where | What links |
| --- | --- |
| `SearchResults` faculty card | the name, plus an explicit **View profile** action button |
| `FacultySlideOver` header | **View full profile ->**, which closes the panel and navigates |

The photo on a result card still opens the slide-over quick preview, so the two affordances are
split rather than stacked on the same element - a name that both previewed and navigated would
be ambiguous.

**The blocker was not only the missing pk.** Wiring the links exposed that
`fetchUnifiedSearch` hardcodes `type: "paper"` on every row, and the endpoint it calls
(`/api/search/` -> `semantic_paper_search`) ranks **papers only**. So the "Faculty Member"
result card - filter chip, inquiry button, slide-over and all - was **unreachable from the home
page**, and linking it would have produced nothing but dead weight. Confirmed against the live
API before changing anything:

```
$ curl -s "https://scoup-salisbury.net/api/search/?q=machine+learning" | jq '.results[0] | keys'
# paper fields only - no faculty in the response at any query
```

Rather than add a second backend ranker, `searchEngine.ts` now matches faculty against the
dataset **already downloaded into the browser** by `Home.tsx` (`setSearchDataset` was keeping
only the words for autocomplete and discarding the records). Two rules are borrowed from the
backend ranker so the two agree: every query term must match, and matches are on **word
boundaries, not substrings**, so "art" does not match "particle". Fields are scored name 92 >
research interests 82 > keywords 72 > themes 68 > title 60 > department 55, with a bonus when
the matched value is the query exactly. Faculty and paper results are merged and sorted by
confidence; if the paper request fails, faculty results still render instead of an empty page.

`matchedKeywords` reports only the interests that actually matched, so the card's gold
highlighting marks real evidence rather than every tag on the record. Term regexes are compiled
once per search, not once per record - the index is ~1,600 people wide.

- **Verification - the production bundle against a real backend, not mocked.** `dist/` served on
  :4173 with SPA fallback, proxying `/api` to a Django dev server on :9123 running against a
  throwaway copy of the database. Same-origin, so it reproduces production exactly. Playwright
  over the system Chromium at `/usr/bin/chromium-browser`.

| Check | Result |
| --- | --- |
| `/api/public/search-data/` carries `profileId` | 182/182 faculty; `SU-DIR-acocella-c` -> `1668` |
| home search "Acocella" | 1 Faculty Member card, 2 links, both `/faculty/1668` |
| clicking the name | `/faculty/1668`, h1 **"Cecilia Acocella"** - byte-matching `/api/faculty/1668/public/` |
| home search "sociology" | 9 faculty cards, 18 profile links (9 names + 9 View profile) |
| home search "computer sciences" | 9 faculty cards, 18 profile links |
| home search "Nursing" | 38 results; 18 faculty cards and 36 links once paged past the higher-confidence papers |
| slide-over -> **View full profile** | closes the panel and lands on the matching profile |
| home search "machine learning" | 0 faculty - correct: **no** faculty record contains both terms anywhere (verified directly against the payload, not inferred from the empty UI) |
| console errors across every search | none |

`npx tsc --noEmit` reports **no new errors** - the ones it prints (`AdminDashboard` tab types,
`BrowseCategories` line 875, `replaceAll` lib target, versioned `ui/*` import specifiers,
`publicData.ts` implicit anys) are all pre-existing and in files untouched here. Build succeeds
(2,327 modules, `index-CoEyds-2.js` 1.16 MB), built with `env -u VITE_API_BASE_URL` and
re-checked for `onrender` (**0** occurrences) per the backend log's `INCIDENT-20260829-1749`.

**Stylesheet discipline.** Every class was checked against `src/index.css` first. `underline`
was written and **caught as inert - the base class does not exist in the stylesheet at all**
(only `underline-offset-4` and `hover:underline` do). Replaced with `hover:underline` plus a
`->` glyph so the link still reads as one. All other classes used
(`text-xs`, `text-gray-500`, `transition-colors`, `hover:text-[#8b0000]`, `text-xl`,
`font-medium`, `w-4`, `h-4`) were confirmed present.

- **Status:** In repo, built successfully, **not deployed** - `/var/www` left untouched by
  instruction. Requires the backend commit `ac37ffc` (already live) for `profileId`.
- **Push:** commit `34b4558` is **local-only**. This repo's remote is SSH
  (`git@github.com:sweetrellish/scoup-frontend-2.0.git`) and `~/.ssh/id_ed25519` is
  passphrase-protected with nothing loaded in the agent (`ssh-add -l` -> "The agent has no
  identities"), so `git push` blocks on the passphrase prompt. Same cause as the 18:32 entry.
  To push: `ssh-add ~/.ssh/id_ed25519 && cd ~/scoup-frontend-2.0 && git push`. The backend
  repo uses HTTPS and pushed cleanly.

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
| 7 | **`src/index.css` is precompiled and nothing regenerates it** - unknown Tailwind classes are silently inert. Add `tailwindcss` as a build dependency | Not started - see 2026-08-29 16:40 |
| 8 | `ExpertsPage.tsx` **and `CapabilitiesPage.tsx`** use inert classes (`pl-9`, `pr-3`, `max-w-xl`, `text-[11px]`, `focus:ring-[#8b0000]/30`) | Not started - see 2026-08-29 18:35 |
| 9 | React "unique key prop" warning in `AdminOverviewPage` | Not started |
| 10 | Home-page search results cannot link to `/faculty/<id>`: `/api/public/search-data/` returns `faculty_id` slugs, not the pk. Needs the pk added to that payload (backend + deploy) | **Done** (2026-08-29 18:50) - `profileId` wired through; faculty results also made reachable, see that entry |
| 11 | `/docs` calls `GET /api/contact/settings/`, which does not exist - a 404 on every load | **Done** (2026-08-29 18:55) - backend built; see the backend log. Both `/contact` and `/docs` now load with zero API 4xx |
| 12 | Uploaded photos (contact team **and** faculty) are stored but unreachable - nginx has no `location /media/`, so `/media/...` returns `index.html`. Backend open item #21 | Not started - needs a root nginx change |
