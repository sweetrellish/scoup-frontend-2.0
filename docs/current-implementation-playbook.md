# SCOUP Frontend Implementation Playbook

This document captures the current frontend architecture as it exists in the shipped product, including the sections built by the current agents and worker runs. It is intended as a reference for presentations, debugging, and future extensions.

---

## 1. Public website architecture

### Root shell

- `src/App.tsx` controls route selection and role gating.
- The app distinguishes between public, faculty, and admin access.
- It enforces route restrictions so faculty/admin pages are not reachable without the appropriate authenticated state.

### Public flows

- `/` — home search and analytics
- `/search` — dedicated full search experience
- `/browse` — category discovery and filters
- `/expertise-map` — expertise map UI and ranked subject exploration
- `/about`, `/contact`, `/docs` — support and docs surfaces
- `/faculty/<id>` — public faculty profile route

### Department and category model

The public site exposes browsing by subject matter, not just free-text search. The home page can infer category matches from the loaded dataset, and the expertise map visualizes research clusters around actual faculty and paper signals.

---

## 2. Search experience

### Dataset loading

`fetchPublicDataset()` in `src/utils/publicData.ts` loads the public JSON payload from the backend and normalizes it before it is used in the UI.

### Search indexing

`setSearchDataset()` in `src/utils/searchEngine.ts` builds in-memory indexes for:

- faculty names and research interests
- paper titles and keyword metadata
- project titles and keywords
- patent titles and keyword metadata

### Suggestions and fuzzy behavior

The search system supports:

- typeahead suggestions
- “Did you mean?” corrections
- fuzzy word-distance correction for misspelled terms
- result-type filters for faculty, papers, patents, and projects

This gives the site a practical search feeling even though the authoritative ranking/filtering still comes from the backend.

---

## 3. Result confidence model

The frontend result confidence model is deliberately conservative:

- exact title phrase matches score highest
- all query terms must be present in multi-word queries
- title hits outrank abstract hits
- keyword-only matches are weaker than title/content evidence
- generic or broad tags do not dominate the output

This is intentionally aligned with the backend trust model so that the visible result set is not polluted by noisy data.

---

## 4. Expertise map implementation

`CapabilitiesPage.tsx` is the current expertise-map implementation.

It includes:

- bubble-style data clusters
- ranked subtopic panels
- faculty cards that show actual metrics and real research metadata
- evidence-driven drilling into departments and expertise areas

This was rebuilt to replace a duplicate category page and an earlier “capabilities” abstraction that did not add a materially different user experience.

---

## 5. Faculty profile implementation

`FacultyProfilePage.tsx` displays the public faculty profile page with:

- department and title data
- keywords and profile interests
- public paper context
- faculty access to connect or inquire

This route is critical because the home search experience links into actual faculty records instead of dead-end or non-actionable cards.

---

## 6. Admin review queue pattern

The faculty review queue in `PendingApprovalsPage.tsx` is the model for the paper review queue.

It includes:

- queue list with review evidence
- match-type filtering
- approve/reject actions
- optional rejection note handling
- evidence cards showing the directory comparison logic behind each decision

This user experience is the frontend pattern the paper review UI reuses.

---

## 7. Public inquiry and support flows

`SearchResults.tsx` handles the collaboration inquiry experience.

The flow includes:

- faculty inquiry modal
- project-interest modal
- name/email/organization inputs
- note submission to the backend inquiry API
- success and error states

Support tickets are handled through a public-facing floating support button that routes to the admin support workflow.

---

## 8. Current data trust model

The frontend is only as trustworthy as the dataset it receives.

The current product keeps a strict separation between:

- approved public records
- pending review records
- rejected or temporarily hidden records

This is why the backend filters public search to approved records only and why the frontend never assumes that a raw dataset entry is automatically visible.

---

## 9. Current dependency map

The most important frontend dependencies are:

- `src/App.tsx` — route guard and shell
- `src/components/Home.tsx` — search + analytics
- `src/components/SearchResults.tsx` — result cards and inquiry UI
- `src/components/CapabilitiesPage.tsx` — expertise map
- `src/utils/publicData.ts` — public dataset fetch
- `src/utils/searchEngine.ts` — in-memory search and suggestion logic
- `src/utils/datasetNormalization.ts` — data cleanup and field normalization
- `src/utils/api.ts` — auth and admin calls

---

## 10. Operational notes

This frontend is intentionally built around live backend data and should remain paired to the backend API contract. The biggest risks are:

- stale or contaminated environment variables
- a backend response shape change without a matching normalization fix
- search/data drift caused by returning too much noisy metadata to a user-facing dataset

The current build is best treated as a presentation-grade public discovery surface built on a carefully curated trust boundary.
