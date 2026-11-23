# SyncSpace – Real-Time Collaborative Workspace

> A production-ready, full-stack collaborative productivity platform built with **React 19**, **Tailwind CSS**, **Node.js/Express**, **MySQL 8.0**, **Yjs CRDTs**, and **Hocuspocus WebSockets**.

![Forest Theme](https://img.shields.io/badge/Design_Theme-Forest_Green-123C32?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.3-205C49?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-328565?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8.3-70B99A?style=for-the-badge&logo=vite)
![Status](https://img.shields.io/badge/Status-Phases_1_through_8_Completed-205C49?style=for-the-badge)
![Automated Tests](https://img.shields.io/badge/Tests-56_Passed_100%25-328565?style=for-the-badge)

---

## 1. Project Overview

**SyncSpace** is an academic and enterprise-grade collaborative workspace application developed for the React.js course syllabus. It combines modular workspaces, rich-text document authoring, real-time multi-user simultaneous editing with Conflict-free Replicated Data Types (Yjs CRDTs), in-document discussion threads, historical revision snapshots with non-destructive restoration, workspace invitations, and in-app notifications into a coherent application.

All 5 core course units (JSX, Component Architecture, State & Props, Synthetic Events & Forms, React Router DOM, Hooks & Context API) are demonstrated with live interactive widgets and production code.

---

## 2. Key Modules & Features

1. **Module 1 – Workspace & Dashboard Management**
   - Central dashboard with workspace statistics, activity feed, and quick actions.
   - Dynamic workspace categorizing (`Engineering`, `Product`, `Marketing`, `Operations`).
   - Workspace creation modal with accessible keyboard support (`Escape` dismissal).
   - Starred favorites bookmarking with client-side and backend persistence.
   - Role-Based Access Control (RBAC): `Owner`, `Editor`, and `Viewer`.

2. **Module 2 – Collaborative Rich-Text Document Editor**
   - Headless rich-text editor powered by **Tiptap 3.x**.
   - Formatting toolbar: Bold, Italic, Underline, Strikethrough, Code, Headings (H1-H3), Bullet/Numbered lists, Blockquotes, 3x3 Tables, Dividers.
   - Dual persistence: debounced REST API autosave to MySQL + continuous WebSocket binary CRDT synchronization.
   - Viewer mode: View-Only banner, disabled formatting toolbar, and read-only title for Viewer roles.

3. **Module 3 – Real-Time Collaboration Engine**
   - **Yjs CRDTs**: Mathematically proven peer-to-peer conflict-free document convergence.
   - **Hocuspocus WebSocket Gateway**: Sub-50ms delta exchanges listening on `ws://localhost:1234`.
   - Real-time presence indicators: dynamic avatar stack showing active online collaborators.
   - Live carets and colored selection flags with stable deterministic colors from the Forest palette.
   - 100% convergence verified with automated multi-peer simultaneous editing simulation.

4. **Module 4 – Team Management & Invitations Pipeline**
   - Member roster with role badges (`Owner`, `Editor`, `Viewer`).
   - Role modification and member removal (Owner-only privilege).
   - Shareable token-based invitation links with dedicated acceptance landing page (`/invite/:token`).

5. **Module 5 – Discussions & In-Document Comments**
   - Right-hand collapsible slide-in comments drawer.
   - Threaded discussions with nested replies and timestamps.
   - Open vs Resolved comment status toggles.

6. **Module 6 – Version History Snapshots & Non-Destructive Restore**
   - Explicit named revision snapshots ("Release v1.0", "CRDT Spec Draft").
   - Snapshot preview modal comparing past versions.
   - **Non-Destructive Restore**: Restoring an earlier snapshot creates a new version snapshot (`Restored from vX.X`), guaranteeing 100% audit trail preservation.

7. **Module 7 – Notification Center & Audit Logs**
   - Top navigation notification bell with dynamic unread counter badge.
   - Popover dropdown to review alerts, mark individual items as read, or dismiss all.
   - Workspace activity audit logs.

8. **Module 8 – Academic React Syllabus Showcase**
   - Dedicated `/react-concepts` route with live interactive widgets for Units I through V.
   - Includes standard class component demonstration with `this.props`, `this.props.children`, and `bind()`.

---

## 3. Technology Stack

| Layer | Technologies | Role in Architecture |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, React Router DOM v7 | Single Page Application (SPA) client |
| **Rich Text** | Tiptap 3.x, `@tiptap/starter-kit`, `@tiptap/extension-table` | Headless, extensible editor canvas |
| **CRDT Engine** | Yjs, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-caret` | Conflict-Free Replicated Data Types & carets |
| **WebSockets** | Hocuspocus Server v4, `@hocuspocus/provider` | Real-time WebSocket synchronization gateway |
| **Backend API** | Node.js, Express.js, JWT, bcryptjs, cors | REST API endpoints & authentication |
| **Database** | MySQL 8.0 (mysql2) + integrated in-memory fallback | Relational persistence & transactional storage |
| **Testing** | Vitest, React Testing Library, jsdom, supertest | 56 automated unit & integration tests |
| **Deployment** | Netlify (frontend), Render / Railway (API & WebSockets), Docker | Containerized & cloud hosting |

---

## 4. Visual Design System – Forest Theme

SyncSpace features a custom-crafted **Forest – Elegant Green** design system with full Light and Dark mode support:

- **Deep Forest Green** (`#123C32`) – Sidebar and primary branding
- **Forest Green** (`#205C49`) – Primary action buttons and active navigation states
- **Emerald** (`#328565`) – Badges, checkmarks, and presence indicators
- **Sage Green** (`#70B99A`) – Borders, dividers, and focus rings
- **Soft Mint** (`#DCEFE5`) – Subtle card backgrounds and badges
- **Light Surfaces** (`#F7FAF7`) / **Dark Surfaces** (`#101C18` and `#192A23`)

Theme toggle switches instantly between light and dark surfaces, synchronizes `dark` class on root HTML, and persists to `localStorage`.

---

## 5. Project Directory Structure

```
syncspace/
├── frontend/                     # React 19 + Vite + Tailwind SPA
│   ├── src/
│   │   ├── api/                 # Axios apiClient with JWT interceptors
│   │   ├── components/
│   │   │   ├── common/          # Reusable Button, Card, Badge, Modal, Input, Avatar
│   │   │   ├── layout/          # AppLayout, Sidebar, TopNavbar
│   │   │   ├── dashboard/       # WelcomeHero, WorkspaceCard, RecentDocs, ActivityFeed
│   │   │   ├── editor/          # CollaborativeEditor (Tiptap + Yjs + Presence)
│   │   │   ├── comments/        # DocumentCommentsDrawer
│   │   │   └── versions/        # DocumentVersionsDrawer
│   │   ├── context/             # ThemeContext, AuthContext, WorkspaceContext
│   │   ├── pages/               # All Module Pages + ReactConceptsPage + AcceptInvitePage
│   │   ├── test/                # 9 Vitest & RTL test suites (21 tests)
│   │   └── utils/               # Forest theme mock data & utilities
│   ├── public/                  # Favicon, icons, _redirects (SPA routing)
│   ├── Dockerfile & nginx.conf  # Production containerization
│   └── netlify.toml             # Netlify deployment configuration
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/         # Auth, workspace, document, team, comment, version, notif
│   │   ├── routes/              # Express API route declarations
│   │   ├── middleware/          # JWT authMiddleware
│   │   └── database/            # MySQL pool with auto in-memory relational fallback
│   ├── test/                    # 3 Vitest API test suites (32 tests)
│   └── Dockerfile               # Production containerization
├── collaboration-server/         # Hocuspocus WebSocket CRDT Server
│   ├── src/
│   │   └── server.js            # WebSocket server on port 1234 with binary MySQL persistence
│   ├── test/                    # Collab tests & multi_user_simulation.js (3 tests)
│   └── Dockerfile               # Production containerization
├── database/                     # MySQL 8.0 schema & seed scripts
│   ├── schema.sql               # 11 normalized relational tables
│   └── seed.sql                 # Comprehensive demo seed data
├── docs/                         # Master Academic Documentation
│   ├── REACT_SYLLABUS_MAPPING.md
│   ├── PROJECT_ARCHITECTURE.md
│   ├── SETUP_AND_INSTALLATION.md
│   ├── API_DOCUMENTATION.md
│   ├── TESTING_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
├── docker-compose.yml            # Multi-service local/production orchestration
└── render.yaml                   # Cloud deployment blueprint
```

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- MySQL Server 8.0 *(Optional: if MySQL is not running, the application automatically activates an integrated in-memory relational store!)*

### Option A: Standard Local Execution (3 Terminals)

#### Terminal 1: Backend REST API
```bash
cd backend
npm install
npm run dev
```
*Listening on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

#### Terminal 2: Real-Time Collaboration Server
```bash
cd collaboration-server
npm install
npm start
```
*Listening on `ws://localhost:1234`*

#### Terminal 3: React Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Listening on `http://localhost:5173`*

---

### Option B: Docker Compose (All Services in 1 Command)
```bash
docker-compose up --build
```
*Starts MySQL 8.0, Backend REST API on `:5000`, Hocuspocus Collaboration Gateway on `:1234`, and React SPA on `:5173`.*

---

## 7. Running the Test Suite (56 Tests Passing)

SyncSpace includes 56 automated unit, API, and integration tests across 13 test files:

### 1. Frontend Test Suite (9 files, 21 tests)
```bash
cd frontend
npm test
```
- `Button.test.jsx`: Button states, spinner loading, click handlers.
- `ThemeContext.test.jsx`: Light/Dark toggle, localStorage persistence.
- `AppRouting.test.jsx`: Full app shell mounting, navigation guards.
- `FavoritesFilter.test.jsx`: Workspaces filtering and starred toggles.
- `CollaborativeEditor.test.jsx`: Tiptap formatting controls, carets, avatar presence.
- `DocumentEditor.test.jsx`: Toolbar actions (H1, H2, Bold, Italic, Underline, Table).
- `TeamAndComments.test.jsx`: Member roster, roles, invitations, comment threads.
- `VersionsAndNotifications.test.jsx`: Snapshot drawers, notification center popover.
- `EndToEndIntegration.test.jsx`: Full end-to-end user journey across all modules.

### 2. Backend REST API Test Suite (3 files, 32 tests)
```bash
cd backend
npm test
```
- `api.test.js`: Auth register/login/me, workspaces CRUD, document operations.
- `team_comments.test.js`: Team roles, invitations lifecycle, comments & replies, activity logs.
- `versions_notifications.test.js`: Version snapshots, non-destructive restore, notifications.

### 3. Collaboration Server Test Suite (1 file, 3 tests + Multi-User Simulation)
```bash
cd collaboration-server
npm test
node test/multi_user_simulation.js
```
- Tests WebSocket authentication handshake, CRDT state sync, and user presence awareness.
- Multi-user simulation runs 3 concurrent users editing simultaneously with **100% mathematical CRDT convergence**.

---

## 8. Development Phases Summary

- [x] **Phase 1: Project Setup and UI Foundation** *(Completed & Tested)*
- [x] **Phase 2: Authentication and Workspace Management** *(Completed & Tested)*
- [x] **Phase 3: Document Management and Rich-Text Editor** *(Completed & Tested)*
- [x] **Phase 4: Real-Time Collaboration (Yjs + Hocuspocus)** *(Completed & Tested)*
- [x] **Phase 5: Team Management and Comments** *(Completed & Tested)*
- [x] **Phase 6: Version History and Notifications** *(Completed & Tested)*
- [x] **Phase 7: Testing and Full Integration** *(Completed & Tested)*
- [x] **Phase 8: Deployment and Final Academic Deliverables** *(Completed & Tested)*

---

## 9. Academic Course Mapping

SyncSpace is mapped to the academic React.js course syllabus:
- Detailed breakdown in [`docs/REACT_SYLLABUS_MAPPING.md`](docs/REACT_SYLLABUS_MAPPING.md).
- Live interactive demonstrations at route `/react-concepts`.
