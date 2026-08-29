# SCOUP — Faculty Research Discovery Platform

**Salisbury University · v2.0**

SCOUP (Salisbury Collaborative Open University Platform) is a full-stack web application that makes Salisbury University faculty research expertise discoverable to external collaborators, industry partners, and the public. It combines AI-powered semantic search, structured research browsing by discipline, faculty portfolio management, and a direct communication pipeline between all parties.

---

## What It Does

| For the Public | For Faculty | For Admins |
|---|---|---|
| Search faculty, papers, patents, and projects by natural language query | Manage a full research profile — publications, patents, projects, CV upload | Approve and manage faculty accounts |
| Browse 16 NSF research disciplines with faculty and theme carousels | View analytics on citations, co-authorship, and publication trends | Send direct portal messages to faculty |
| Send collaboration inquiries directly from search results | Receive and manage collaboration inquiries | Review and act on all platform inquiries |
| Submit support tickets from any public page | View messages from administrators | Manage support tickets from all users |

---

## Live URLs

| Service | URL |
|---|---|
| Frontend | [scoup-frontend-2-0.onrender.com](https://scoup-frontend-2-0.onrender.com) |
| Backend API | [scoup-backend.onrender.com/api/](https://scoup-backend.onrender.com/api/) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Django 4, Django REST Framework |
| Database | PostgreSQL (Render) / SQLite (local dev) |
| Auth | JWT (djangorestframework-simplejwt) |
| AI / ML | OpenAI API — keyword generation, bio generation, CV extraction, semantic search |
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
cd ../scoupdb
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Required environment variables (set in `.env` or Render dashboard):

| Variable | Purpose |
|---|---|
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
|---|---|
| `docs/frontend-overview.md` | Every public page, faculty dashboard tab, and admin dashboard tab — what each does and how it works |
| `scoupdb/docs/backend-architecture-and-api.md` | Data models, API endpoints, backend structure |
| `scoupdb/docs/search-engine.md` | How the search engine works — lexical scoring, semantic fallback, query expansion |
| `HANDOFF_NOTES.md` | Backend architecture decisions — school/department model, faculty review workflow |
| `PRESENTATION_NOTES.txt` | Why the search engine moved from client-side to server-side |

---

## Project Structure

```
SCOUP_FINAL/
├── scoup-frontend-2.0/     # React frontend
│   ├── src/
│   │   ├── App.tsx         # Root router and auth state
│   │   ├── components/     # All pages and dashboard tabs
│   │   └── utils/api.ts    # All API calls and token management
│   └── docs/               # Frontend documentation
└── scoupdb/                # Django backend
    ├── academic/           # Core app — models, views, search, auth
    └── docs/               # Backend documentation
```

---

## User Roles

- **Public** — no login required; can search, browse, submit inquiries and support tickets
- **Faculty** — self-register at `/faculty-signup`; account requires admin approval before login works
- **Admin** — Django staff or superuser account; login at `/admin-login`

---

*SCOUP v2.0 · Salisbury University · Spring 2026*
