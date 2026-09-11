# Support CRM — Frontend

A customer support ticketing CRM frontend built with React, Vite, Tailwind CSS, and React Router according to technical assessment specifications.

---

## 🔐 Role-Based Access & Demo Credentials

The application features a **separated dual-portal architecture**:
1. **Support Admin / Operations CRM** (`/`): Ticket queue monitoring, triage, status updates, internal notes, SLA timers, and incident linking.
2. **Customer Helpdesk Portal** (`/portal`): Intake request submission, personal ticket tracking ("My Tickets"), and self-help knowledge base.

### 🔑 Hardcoded Demo Credentials (1-Click Login Available on UI)

| Role | Email | Password | Access / Environment |
| :--- | :--- | :--- | :--- |
| **Support Admin** | `admin@datastraw.io` | `admin123` | Full Support CRM Workspace & Queues (`/`) |
| **Customer / Client** | `customer@example.com` | `customer123` | Customer Helpdesk & Ticket Tracker (`/portal`) |

> 💡 **Tip for Evaluators**: On the `/login` screen, you can click either **"Demo Admin"** or **"Demo Customer"** to instantly log in with one click without typing credentials.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create or verify `.env` in the `client/` root:
```env
VITE_API_BASE_URL=http://localhost:5000
```
*(Reference provided in `.env.example`)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
```bash
npm run build
```

---

## 🛠️ Tech Stack & Philosophy
- **Core**: React 18 (Functional components & hooks)
- **Tooling**: Vite (ESM fast builds)
- **Styling**: Tailwind CSS (Utility-first, restrained CRM palette, no heavy UI kits)
- **Routing**: React Router DOM v6 with role-based Route Guards
- **Data Fetching**: Native Fetch API with centralized service abstraction (`ticketApi.js`)

> **Design Choice**: Kept intentionally simple, maintainable, and free of unnecessary state libraries (Redux/Zustand) or component frameworks (Material UI/Bootstrap) to ensure a clean, explainable architecture.

---

## 📁 Architecture & Directory Responsibilities

```text
client/
├── public/               # Static public assets (favicon.svg)
├── src/
│   ├── assets/           # Application images & icons
│   ├── components/
│   │   ├── auth/         # ProtectedRoute.jsx route guard
│   │   ├── common/       # Reusable primitives (Button, Input, Textarea, Select,
│   │   │                 # LoadingState, EmptyState, ErrorState, PageHeader, Toast)
│   │   ├── layout/       # App shells (Navbar, Sidebar, CustomerNavbar, PageContainer)
│   │   ├── search/       # Filter controls (SearchBar, StatusFilter)
│   │   └── tickets/      # Ticket display (TicketTable, TicketCard, TicketList,
│   │                     # StatusBadge, TicketMeta, SlaBadge)
│   ├── context/          # AuthContext.jsx session & credentials management
│   ├── hooks/            # Reusable state logic (useTickets.js)
│   ├── pages/            # Route-level views:
│   │                     # • Login.jsx (Auth portal with 1-click demo logins)
│   │                     # • CustomerPortal.jsx (Customer intake & "My Tickets")
│   │                     # • CustomerTicketView.jsx (Customer resolution timeline)
│   │                     # • Home.jsx, CreateTicket.jsx, TicketDetails.jsx
│   │                     # • Analytics.jsx, Incidents.jsx, KnowledgeCenter.jsx
│   ├── routes/           # Central route configuration (AppRoutes.jsx)
│   ├── services/         # Centralized HTTP REST client (ticketApi.js)
│   ├── utils/            # Constants, date formatting, and form validation
│   ├── App.jsx           # Clean root entry
│   ├── main.jsx          # DOM mount
│   └── index.css         # Tailwind directives
└── vite.config.js        # Vite configuration
```

---

## 🔌 API Endpoint Mapping

| Frontend Component | HTTP Method | Server Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `Home.jsx` | `GET` | `/api/tickets` | Retrieve all tickets |
| `SearchBar.jsx` | `GET` | `/api/tickets?search={query}` | Search by customer, email, subject, or description |
| `StatusFilter.jsx`| `GET` | `/api/tickets?status={status}`| Filter by `Open`, `In Progress`, or `Closed` |
| `CreateTicket.jsx` / `CustomerPortal.jsx` | `POST` | `/api/tickets` | Create ticket with customer details and issue |
| `TicketDetails.jsx` / `CustomerTicketView.jsx` | `GET` | `/api/tickets/{ticket_id}` | Fetch individual ticket details |
| `TicketDetails.jsx`| `PUT` | `/api/tickets/{ticket_id}` | Update status and/or append internal notes |

---

## 🌟 Key Features & Standout Architecture

1. **Separated Portals for Customer vs. Agent**:
   - **Customer Portal**: Self-service inquiry submission, personal ticket tracking with a 3-step visual progress bar, and FAQs.
   - **Agent Workspace**: Live queue management, status updating, internal notes, SLA timers, and incident triage.
2. **Premium Login Experience**:
   - Clean enterprise design with role tabs and instant 1-click demo credentials for painless evaluator testing.
3. **Session Persistence**:
   - Client-side auth with `localStorage` persistence and automatic route protection (`ProtectedRoute`).
4. **Adaptive Responsive Views**:
   - Desktop full-width table & mobile touch-optimized card layout.
5. **Detailed Ticket Management**:
   - Complete issue description, status updating, and chronological internal notes log.
