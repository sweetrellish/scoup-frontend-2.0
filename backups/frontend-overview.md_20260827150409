# SCOUP — Frontend Feature Overview

**Version:** 2.0  
**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Lucide Icons · Recharts  
**Deployment:** Render (frontend static build)  
**Brand color:** Salisbury University Cardinal Red `#8b0000`

---

## 1. User Roles

SCOUP has three distinct user types, each with a completely different experience:

| Role                   | Access                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public / Anonymous** | Home search, Browse Categories, About, Contact, collaboration inquiry, support ticket submission                                                                          |
| **Faculty**            | Full dashboard — profile, papers, patents, projects, PDF upload, analytics, network, inquiries, messages, badges, settings                                                |
| **Admin**              | Admin dashboard — faculty management, pending approvals, department management, inquiries, messaging, support tickets, analytics, strategic insights, contact page editor |

---

## 2. Public Site

### 2.1 Home Page — AI Search

The primary entry point. No login required.

- **Full-width search bar** — searches faculty, papers, patents, and projects simultaneously
- **Real-time autocomplete** — suggestion dropdown appears as the user types
- **Query expansion** — abbreviations and synonyms expanded automatically (`"AI"` → `"artificial intelligence"`, `"ML"`, `"NLP"`, `"CV"`, and 30+ others)
- **"Did You Mean"** suggestion bar shown when query confidence is low
- **Result type filters** — toggle Faculty / Papers / Patents / Projects to narrow visible results
- **Result cards** per type:
  - _Faculty:_ photo, name, title, department, research interests, NSF categories (clickable to Browse), confidence score, AI match summary, email/phone, Send Request button
  - _Papers:_ title, authors, journal, year, abstract preview, AI keywords, DOI link
  - _Patents:_ title, inventors, patent number, filing/issue dates, AI keywords, patent link
  - _Projects:_ title, lead faculty, status badge, description, collaboration openness badge, Express Interest button
- **Collaboration inquiry modal** — launched directly from any faculty or project result card
- **Platform statistics** — total publications, faculty members, active patents, ongoing projects
- **Charts** — Publications Per Year (line chart), Faculty by Department (bar chart)
- **Load More** pagination for results
- **Back to Home** button resets search state without a page reload

### 2.2 Browse Categories

A structured alternative to search — explore research by discipline.

**Category Index (`/browse`):**

- Searchable grid of **16 NSF top-level research disciplines**
- Each card shows sub-fields, faculty count, and paper count
- Inline sub-field expansion without leaving the page
- Cards link through to the full category detail page

**Category Detail Page (`/browse/<slug>`):**

- **Statistics panel** — faculty count, departments represented, total papers, total and average citations
- **Top Faculty carousel** — paginated faculty cards for this discipline; click any card to drill into their profile
- **Research Themes carousel** — paginated list of research themes within the category
- **Faculty drill-down view** — selecting a faculty card opens a detailed in-page view:
  - Profile card: photo, name, title, department
  - Papers filtered to that faculty member
  - Theme and keyword filtering within their paper list
  - **Send Request** button to submit a collaboration inquiry
- **Paper search** — keyword and theme-based search within the category
- **Back to Categories** navigates back to the index in the same tab

### 2.3 About Page

- Platform mission and capabilities overview
- Six feature highlight cards: AI-Enhanced Discovery, Collaboration Networks, Industry Partnerships, Expertise Mapping, Direct Communication, Team Formation
- Benefits grid: Immediate Discovery, University Integrated, 24/7 Support
- Call-to-action links to faculty signup and login

### 2.4 Contact Page

- Dynamically loaded from the backend — admin can update all content without a code deploy
- General inquiries and technical support contact cards
- SCOUP team member profiles: photo, name, role, bio, email and LinkedIn links
- Physical address and GitHub project link

### 2.5 Floating Support Button

Visible on every **public page** — not shown inside the faculty or admin dashboards.

- Fixed cardinal red lifebuoy icon, bottom-right corner of the screen
- Opens a compact modal ticket form:
  - **Ticket type:** Bug Report, Account Issue, Content/Data Issue, Feature Request, Other
  - **Subject** and **Description** (both required)
  - Anonymous users: name and email fields appear automatically
  - Authenticated faculty: submits under their account
- Success state with 2.2-second auto-close
- Submitted tickets appear directly in the admin Messages → Support Tickets tab

### 2.6 Faculty Signup

- Fields: first name, last name, email, username, password, confirm password
- Live password strength checklist: 8+ characters, at least one number, at least one special character
- On success: 5-second countdown then auto-redirect to login

### 2.7 Faculty Login

- Login by **email or username**
- Password show/hide toggle
- **Forgot Password** modal — enter email, receive reset link
- Link to signup page

### 2.8 Admin Login

- Separate login page (`/admin-login`)
- Only Django staff or superuser accounts are accepted
- Routes to admin dashboard on success

### 2.9 Password Reset

- Token-based reset flow via emailed link
- Institutional email OTP verification for `.edu` addresses
- Change password available to authenticated users from Settings

---

## 3. Faculty Dashboard

Accessed after faculty login. Collapsible sidebar — full labels when expanded, icon-only when collapsed. Active tab highlighted in cardinal red.

### 3.1 Overview

- Profile completion progress bar with percentage
- Quick stats: papers, projects, patents
- Quick-access cards linking to main dashboard sections
- Profile verification banner (prompts institutional `.edu` email OTP verification)
- Badges summary widget

### 3.2 Profile

- Upload and change profile photo with live preview
- Edit all fields: first/last name, email, phone, office, room, title, department, bio, personal website URL
- **AI-generated bio** — one-click generation based on existing publications and keywords
- **AI-generated research interests** — derived from publication titles and abstracts
- **AI-generated faculty keywords** — extracted from papers
- Qualifications manager: add/remove degrees with institution name and year
- Profile visibility toggle — controls whether the faculty member appears in public search
- Profile completion percentage updates live as fields are filled
- Cancel button restores original data if edits are abandoned

### 3.3 Papers

- Full list of linked publications: title, authors, journal, year, DOI, keywords, citation count, status badge
- Add paper manually (title, DOI, journal, year, abstract)
- **CrossRef integration** — search by DOI or title to auto-fill bibliographic details
- Edit and delete existing papers
- Status management: Draft → In Review → Published
- Lazy abstract enrichment — CrossRef abstracts fetched in the background after page load

### 3.4 Patents

- List of patents: number, title, inventors, filing date, issue date, link to patent record
- Add, edit, and delete patents
- Patents appear in public search results

### 3.5 Projects

- Research projects: title, description, status, start/end dates, funding source, keywords
- **Open to Collaboration** toggle — shows a badge on the public search card, enabling the Express Interest button
- Student interest toggle
- Add, edit, and delete projects

### 3.6 PDF / CV Upload

- Drag-and-drop CV or paper bundle PDF upload
- Automatic paper title extraction from PDF text
- CrossRef search run on each extracted title to auto-fill bibliographic details
- **Review and confirm screen** — faculty approves or rejects each paper before anything is saved
- Bulk publish on confirmation
- AI keyword generation runs on confirmed papers

### 3.7 Analytics

- Publication trend chart (papers per year)
- Citation metrics over time
- Keyword distribution visualization
- Co-authorship network graph
- Research impact statistics

### 3.8 Network

- Discover other faculty with overlapping research keywords
- Shared keyword count and names shown per suggestion
- Cross-departmental connection mapping
- Send a collaboration inquiry directly from a faculty card

### 3.9 Inquiries

- Incoming collaboration requests from external stakeholders and other faculty
- Each card: sender name, email, department/institution, message body, source type, received date, status badge
- Status management: Pending → Reviewed → Closed
- Reply via email link (mailto pre-filled)
- Filter by status

### 3.10 Messages

- **Direct messages** received from administrators — separate from the Inquiries tab
- Message cards: subject, sender name, date and time, status
- Mark Reviewed and Close actions
- **Support Tickets subtab** — view own submitted tickets and any admin response notes

### 3.11 Badges

- Achievement badges for profile completeness, publications, and collaborations
- Displayed as visual achievement cards with criteria

### 3.12 Settings

- Profile visibility toggle
- Change password (same complexity rules as signup)
- Notification preferences

### 3.13 Go to Search

- Sidebar link (bottom, with external link icon) that opens the public home/search page in a **new browser tab**
- The dashboard stays open — both windows are usable simultaneously

---

## 4. Admin Dashboard

Separate login — Django staff or superuser accounts only. Collapsible sidebar with live badge counts on actionable items.

### 4.1 Overview

- Platform-wide metrics: total faculty, pending approvals, open inquiries, open support tickets
- Quick-action cards to all admin sections

### 4.2 Faculty Management

- Full searchable, filterable list of all faculty
- Filters: department, school, approval status, visibility
- Click any row → **slide-over detail panel:**
  - Full profile fields, photo, bio, keywords, qualifications
  - Stats: papers, patents, projects, citations
  - Approve / reject with optional notes
  - Toggle profile visibility
  - **Send Message** — compose and send a direct portal message to that faculty member
- Edit faculty details inline
- Department and school assignment

### 4.3 Pending Approvals

- Queue of faculty accounts awaiting review
- Preview full profile before deciding
- Approve (optional note) or Reject (required note)
- Sidebar badge shows live pending count

### 4.4 Department Management

- Create, edit, delete departments
- Assign departments to schools/colleges
- Department codes, active/inactive toggle, display order

### 4.5 Analytics

- User growth over time
- Profile completion rates across all faculty
- Content volume: papers, patents, projects, inquiries over time
- Search volume trends
- Department-level breakdowns

### 4.6 Strategic Insights

- Emerging research themes across faculty
- Cross-departmental collaboration patterns
- External engagement metrics
- Faculty expertise distribution

### 4.7 Contact Page Editor

- Edit all public Contact page content — no code deploy needed
- Update contact emails, address, GitHub/social links
- Add, edit, remove team member profiles with photo upload
- Control visibility and display order of team members

### 4.8 Inquiries

- All collaboration inquiries across the platform (external and faculty-sourced)
- Admin direct messages are in the Messages tab, not here
- Filter by status (Pending, Reviewed, Closed) and source (Faculty, External)
- Expand any inquiry: full sender info, message body, faculty recipient, timestamps
- Add internal admin notes — not visible to the sender
- Update inquiry status

### 4.9 Messages

**Direct Messages tab:**

- **Sent** subtab — all admin-to-faculty portal messages: subject, recipient (clickable → profile panel), sender, status, date/time
- **Received** subtab — reserved for future faculty-to-admin replies
- **New Message** button → compose modal:
  - Searchable faculty picker (only faculty with active user accounts listed)
  - Optional subject line
  - Required message body
  - Delivers to the recipient's faculty Messages tab
- Clicking a recipient name opens a **profile slide-over panel** with stats and a "Message this Faculty" shortcut

**Support Tickets tab:**

- All tickets submitted via the public floating button or faculty dashboard
- Filter by: All, Open, In Progress, Resolved, Closed
- Ticket cards: type badge, subject, submitter name/email, status, timestamp
- Expand for full description
- Add internal response/notes
- Status workflow: Open → In Progress → Resolved → Closed
- **Reply by Email** button (mailto with pre-filled subject)

### 4.10 Admin Profile

- View and edit admin display name and email
- Change password

### 4.11 Go to Search

- Same sidebar link as faculty — opens public search in a new tab

---

## 5. Authentication

- **JWT-based** — short-lived access token + long-lived refresh token
- Login accepts **username or email**
- **Auto-logout** — if the refresh token expires mid-session, any API call fires a `sessionExpired` DOM event; both dashboards listen and redirect to login automatically
- **Password rules** enforced on both frontend and backend: 8+ characters, at least one number, at least one special character
- Live password strength checklist during signup
- Forgot password / reset flow via emailed token
- Institutional `.edu` email OTP verification

---

## 6. Navigation & UI Conventions

- Sidebar collapses to icon-only mode to maximize content area
- Active tab highlighted in cardinal red (`#8b0000`)
- **"Go to Search"** in both dashboards opens public search in a new tab without interrupting the session
- Public navbar (Home, Browse, About SCOUP) uses SPA routing — no full page reload
- Modals use React portals — render above all content regardless of scroll position
- Session expiry handled gracefully — automatic redirect, no broken UI state

---

## 7. v1 → v2: What Changed

| Area               | v1                                         | v2                                                                                                  |
| ------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Frontend framework | Static HTML / CSS                          | React 18 + TypeScript                                                                               |
| UI design          | Basic forms                                | shadcn/ui + Tailwind CSS                                                                            |
| Search             | Client-side keyword filter on full dataset | Server-side multi-signal ranked search with semantic fallback                                       |
| Browse             | None                                       | 16 NSF category index + detail pages with faculty and theme carousels                               |
| Faculty dashboard  | None                                       | Full CRUD — profile, papers, patents, projects, analytics, network, inquiries, messages, badges     |
| Admin tools        | Django admin panel only                    | Custom admin dashboard — faculty management, approvals, messaging, analytics, insights              |
| CV parsing         | None                                       | PDF upload → CrossRef enrichment → confirm flow → AI keywords                                       |
| Collaboration      | None                                       | Inquiry system, Open to Collaboration badge, admin→faculty direct messages, support ticket pipeline |
| Auth               | Session-based                              | JWT with auto-refresh and auto-logout                                                               |
| Deployment         | —                                          | Render (backend + frontend static)                                                                  |

---

## 8. File Structure

```
src/
├── App.tsx                          # Root router, auth state, role management
├── components/
│   ├── Home.tsx                     # AI search page + result rendering
│   ├── SearchResults.tsx            # Result card components per type
│   ├── BrowseCategories.tsx         # Category index + detail pages
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Navbar.tsx
│   ├── FacultyLogin.tsx
│   ├── FacultySignup.tsx
│   ├── AdminLogin.tsx
│   ├── ResetPassword.tsx
│   ├── FacultyDashboard.tsx         # Faculty sidebar + tab routing
│   ├── AdminDashboard.tsx           # Admin sidebar + tab routing
│   ├── FloatingSupportButton.tsx    # Public-page support ticket widget
│   ├── dashboard/                   # Faculty dashboard tab pages
│   │   ├── ProfilePage.tsx
│   │   ├── PapersPage.tsx
│   │   ├── PatentsPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── PDFUploadPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── NetworkPage.tsx
│   │   ├── InquiriesPage.tsx
│   │   ├── MessagesPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── BadgesWidget.tsx
│   │   ├── DashboardOverview.tsx
│   │   └── VerificationBanner.tsx
│   └── admin/                       # Admin dashboard tab pages
│       ├── AdminOverviewPage.tsx
│       ├── FacultyManagementPage.tsx
│       ├── PendingApprovalsPage.tsx
│       ├── DepartmentManagementPage.tsx
│       ├── AdminAnalyticsPage.tsx
│       ├── StrategicInsightsPage.tsx
│       ├── ContactPageEditor.tsx
│       ├── InquiriesPage.tsx
│       ├── AdminMessagesPage.tsx
│       └── AdminProfilePage.tsx
└── utils/
    └── api.ts                       # All API calls, token management, auth helpers
```
