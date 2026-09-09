# Support CRM — Frontend

A customer support ticketing CRM frontend built with React, Vite, Tailwind CSS, and React Router according to technical assessment specifications.

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
- **Routing**: React Router DOM v6
- **Data Fetching**: Native Fetch API with centralized service abstraction

> **Design Choice**: Kept intentionally simple, maintainable, and free of unnecessary state libraries (Redux/Zustand) or component frameworks (Material UI/Bootstrap) to ensure a clean, explainable architecture.

---

## 📁 Architecture & Directory Responsibilities

```text
client/
├── public/               # Static public assets (favicon.svg)
├── src/
│   ├── assets/           # Application images & icons
│   ├── components/
│   │   ├── common/       # Reusable primitives (Button, Input, Textarea, Select,
│   │   │                 # LoadingState, EmptyState, ErrorState, PageHeader, Toast)
│   │   ├── layout/       # App shell (Navbar, PageContainer)
│   │   ├── search/       # Filter controls (SearchBar, StatusFilter)
│   │   └── tickets/      # Ticket display (TicketTable, TicketCard, TicketList,
│   │                     # StatusBadge, TicketMeta)
│   ├── hooks/            # Reusable state logic (useTickets.js)
│   ├── pages/            # Route-level views (Home, CreateTicket, TicketDetails, NotFound)
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
| `CreateTicket.jsx`| `POST` | `/api/tickets` | Create ticket with customer details and issue |
| `TicketDetails.jsx`| `GET` | `/api/tickets/{ticket_id}` | Fetch individual ticket details |
| `TicketDetails.jsx`| `PUT` | `/api/tickets/{ticket_id}` | Update status and/or append internal notes |

---

## 🌟 Key Features & UX Polish

1. **Ticket Creation Flow**: Centered, accessible form validating customer name, email format, subject, and description. Disables multiple rapid submissions and redirects directly to the newly created ticket with success feedback.
2. **Real-time Search & Filter**: Instant debounced search querying across names, emails, IDs, and descriptions alongside status filtering (`All Statuses`, `Open`, `In Progress`, `Closed`).
3. **Adaptive Responsive Views**:
   - **Desktop**: Full-width interactive `TicketTable` with subtle hover indicators and clickable rows.
   - **Mobile**: Touch-optimized `TicketCard` layout with no horizontal table overflow.
4. **State Handling**:
   - Animated table & card skeletons during loading to prevent layout shifts.
   - Contextual empty states with clear filters or create ticket actions.
   - Graceful error states with retry capabilities and user-friendly messages.
5. **Detailed Ticket Management**:
   - Complete issue description preserving whitespace.
   - Dedicated customer information card with `mailto:` email integration.
   - Chronological internal notes log.
   - Status updating and note appending with toast notifications.
6. **Bonus UX Feature — Ticket Sorting**:
   - Non-intrusive client-side sorting by **Newest**, **Oldest**, and **Recently Updated** using existing timestamp metadata without altering backend API schemas.
