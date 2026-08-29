# SCOUP Website Overview

## What SCOUP Is

SCOUP is a public research discovery and collaboration website. It helps external visitors, faculty, students, and administrators find Salisbury University expertise, view research outputs, and route collaboration interest to the right people.

The current MVP has three main experiences:

-   Public website and search
-   Faculty dashboard
-   Admin dashboard

## User Roles

| Role | Purpose |
|--------------|----------------------------------------------------------|
| Public visitor | Search faculty, papers, projects, and patents; submit collaboration or support inquiries |
| Faculty user | Manage profile, papers, patents, projects, messages, and support tickets |
| Admin user | Approve faculty, manage faculty visibility, review inquiries, send messages, and manage support tickets |

## Public Website

The public website includes:

-   Home/search page
-   Browse categories
-   Faculty profile discovery
-   Contact/support entry points
-   Collaboration inquiry forms
-   Open project interest forms

Public visitors do not need an account to search or submit an inquiry.

## Public Search Flow

1.  A visitor searches by topic, faculty name, department, paper title, project, or patent.
2.  The frontend loads public data from the backend.
3.  Results are ranked and displayed across faculty, papers, patents, and projects.
4.  Result cards explain why they matched.
5.  Visitors can send an inquiry to a faculty member or express interest in an open project.

## Faculty Dashboard

Faculty users can:

-   Edit profile information
-   Upload/change profile photo
-   Add and manage papers
-   Upload a CV PDF and review extracted papers
-   Add and manage patents
-   Add and manage projects
-   Mark projects open to collaborators
-   View messages and collaboration inquiries
-   Submit support tickets
-   View analytics and network suggestions

Faculty accounts are not fully public until institutional email verification and admin approval are complete.

## Admin Dashboard

Admin users can:

-   Review and approve faculty accounts
-   Manage faculty visibility
-   Review collaboration inquiries
-   Send direct messages to faculty
-   Review support tickets
-   Manage contact page content
-   View platform stats and audit logs

Admin access requires a Django user with `is_staff=True`.

## Collaboration Flows

### Direct Faculty Inquiry

1.  Public visitor finds a faculty profile.
2.  Visitor submits an inquiry form.
3.  Inquiry appears in the admin inquiry board.
4.  If the target faculty is a system user, it also appears in that faculty member's dashboard messages.

### Open Project Interest

1.  Faculty marks a project as open to collaboration.
2.  Public search displays an open collaboration prompt on that project.
3.  Visitor or student submits interest.
4.  The message appears for the faculty project owner and in the admin inquiry board.

### Support Ticket

1.  Public visitor or faculty user submits a support ticket.
2.  Admin reviews the ticket in the admin dashboard.
3.  Admin updates status and notes.

## AI-Dependent Features

These require the backend `OPENAI_API_KEY`:

-   CV upload paper extraction
-   AI-generated faculty biography
-   AI-generated research interests
-   AI-generated paper/profile keywords
-   Semantic search embeddings

The core site still works without OpenAI. Public search falls back to lexical matching, and faculty/profile/project/inquiry features continue to work.

## MVP Limitations

-   Email delivery depends on backend email environment configuration.
-   Media files on Render may not persist unless persistent storage or external media storage is configured.
-   Some admin workflows are lightweight and may need role/policy refinement before full institutional rollout.
-   The current deployment may be owned by the original maintainer's personal Vercel/Render accounts.