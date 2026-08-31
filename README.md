# SCOUP — Faculty Research Discovery Platform

Salisbury University · v2.0

SCOUP is a faculty research-discovery application that makes Salisbury University expertise discoverable to external collaborators, industry partners, and the public. It combines search, structured research browsing, faculty profiles, and direct communication flows.

---

## What It Does

| For the Public | For Faculty | For Admins |
| --- | --- | --- |
| Search faculty, papers, patents, and projects by natural language query | Manage a full research profile — publications, patents, projects, CV upload | Approve and manage faculty accounts |
| Browse 16 NSF research disciplines with faculty and theme carousels | View analytics on citations, co-authorship, and publication trends | Send direct portal messages to faculty |
| Send collaboration inquiries directly from search results | Receive and manage collaboration inquiries | Review and act on all platform inquiries |
| Submit support tickets from any public page | View messages from administrators | Manage support tickets from all users |

---

## Live URLs

| Service | URL |
| --- | --- |
| Frontend | Public deployment URL |
| Backend API | Public API URL |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Django 4, Django REST Framework |
| Database | PostgreSQL (Render) / SQLite (local dev) |
| Auth | JWT (djangorestframework-simplejwt) |
| AI / ML | Anthrobpic/OpenAI API — keyword generation, bio generation, CV extraction, semantic search |
| Deployment | Render (backend + frontend static) |

---

## Running the Frontend Locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

By default the frontend points to the production backend. To use a local backend, update the `BASE_URL` in `src/utils/api.ts`.

---

## Running the Backend Locally

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Required environment variables (set in `.env` or Render dashboard):

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Django secret key |
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | AI keyword generation, CV extraction, semantic search |
| `EMAIL_HOST_USER` | Password reset and OTP emails |
| `EMAIL_HOST_PASSWORD` | Email credentials |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Frontend origin(s) allowed to call the API |

---

## Deployment Notes

- Run `python manage.py migrate` after every backend deploy to apply any new migrations.
- If AI keyword generation or CV extraction is not working, verify `OPENAI_API_KEY` is set in the Render environment.
- Profile photos are stored on the local filesystem. On Render this storage is ephemeral — photos are lost on redeploy. For a permanent solution, configure Cloudinary or S3 and update `settings.py` accordingly.
- To seed AI keywords for existing faculty, run: `python manage.py migrate_themes_to_ai_keywords`

---

## Key Documentation

| File | What it covers |
| --- | --- |
| `docs/documentation-index.md` | Entry point for the current frontend documentation set |
| `docs/frontend-overview.md` | Every public page, faculty dashboard tab, and admin dashboard tab — what each does and how it works |
| `docs/current-implementation-playbook.md` | Current product architecture, data flow, and live implementation details |
| `docs/website-overview.md` | High-level overview of the application experience and product scope |

---

## Project Structure

The application is organized as a frontend and backend pair, with the frontend handling the user experience and the backend handling API access, trust rules, and review processes.

---

## User Roles

- **Public** — no login required; can search, browse, submit inquiries and support tickets
- **Faculty** — self-register at `/faculty-signup`; account requires admin approval before login works
- **Admin** — Django staff or superuser account; login at `/admin-login`

---

## Supplemental Current-State Documentation

The project has evolved beyond the original README. This repository now includes the following additional references that reflect the current implementation and the logic behind the live experience:

- `docs/documentation-index.md` — index for the current docs set
- `docs/current-implementation-playbook.md` — current frontend architecture, search behavior, public discovery flows, and admin review pattern
- `docs/frontend-overview.md` — detailed feature overview for the public, faculty, and admin experiences
- `docs/website-overview.md` — project-level overview of the system and user flows

### Current architecture summary

The frontend now loads a public dataset from the backend and renders it through a search-and-discovery experience that includes:

- confidence-aware result cards
- faculty and project inquiry flows
- filters across faculty, papers, patents, and projects
- expertise-map bubble exploration
- public faculty profile pages
- admin approval queue patterns mirroring the current backend review logic
- a shared SU-themed discovery header with desktop navigation and a hamburger menu on narrow screens

### Current data trust model

The frontend is designed to sit on top of a backend that enforces approved-only public visibility and keeps ambiguous or unverified content in private review queues. That means the user-facing product is intentionally safer than a raw metadata dump and is designed to be presentation-ready, not just data-rich.

### Current navigation model

The live public header uses the Salisbury University wordmark, a burgundy discovery navigation bar, and a narrow white/gold/burgundy transition between the logo and nav areas. The desktop header exposes the discovery destinations directly, while mobile and narrow layouts use a hamburger menu so the navigation does not overflow.

---

SCOUP v2.0 · Salisbury University · Spring 2026
