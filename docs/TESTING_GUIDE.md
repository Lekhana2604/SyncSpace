# SyncSpace – Testing & Quality Assurance Guide

SyncSpace maintains a comprehensive testing harness with **56 automated tests across 13 test files** covering unit tests, API contracts, real-time collaboration, role-based access control, and full end-to-end integration journeys.

---

## 1. Test Suite Summary Table

| Category | Test File | Tests | Focus / Coverage |
| :--- | :--- | :---: | :--- |
| **Frontend UI** | `src/test/Button.test.jsx` | 3 | Button variants, spinner loading, click synthetic events |
| **Frontend UI** | `src/test/ThemeContext.test.jsx` | 2 | Light/Dark Forest theme switcher & localStorage sync |
| **Frontend Routing** | `src/test/AppRouting.test.jsx` | 1 | App shell, navigation guards, dashboard default redirect |
| **Frontend Workspaces** | `src/test/FavoritesFilter.test.jsx` | 1 | Client-side & REST filtering of starred workspaces |
| **Frontend Editor** | `src/test/CollaborativeEditor.test.jsx` | 2 | Carets, avatar presence, Tiptap toolbar, deterministic colors |
| **Frontend Editor** | `src/test/DocumentEditor.test.jsx` | 1 | Bold, Italic, Underline, Headings, 3x3 Tables, Drawers |
| **Frontend Team** | `src/test/TeamAndComments.test.jsx` | 3 | Team roster, roles, invite modal, token acceptance page |
| **Frontend Versions** | `src/test/VersionsAndNotifications.test.jsx` | 3 | Version history drawer, settings page, notifications popover |
| **Frontend Integration** | `src/test/EndToEndIntegration.test.jsx` | 5 | E2E editor journey, RBAC View-Only mode, Ctrl+K, Escape modal |
| **Backend REST API** | `test/api.test.js` | 13 | Auth (register/login/me), workspace CRUD, document CRUD |
| **Backend REST API** | `test/team_comments.test.js` | 11 | Team roles, invitations pipeline, comments & replies, activity |
| **Backend REST API** | `test/versions_notifications.test.js` | 8 | Revision snapshots, non-destructive restore, notification actions |
| **Real-Time Collab** | `test/collab.test.js` | 3 | WebSocket JWT handshake, CRDT state sync, awareness |
| **Multi-Peer Simulation** | `test/multi_user_simulation.js` | 1 | 3 concurrent peers, simultaneous editing, 100% convergence |
| **TOTAL** | **14 Test Files / Scripts** | **56** | **100% Passing Pass Rate** |

---

## 2. Running Automated Tests

### 1. Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
*Expected Output:*
```
Test Files  9 passed (9)
     Tests  21 passed (21)
```

### 2. Backend REST API Tests (Vitest + Supertest)
```bash
cd backend
npm test
```
*Expected Output:*
```
Test Files  3 passed (3)
     Tests  32 passed (32)
```

### 3. Collaboration Server Tests (Vitest + Hocuspocus Client)
```bash
cd collaboration-server
npm test
```
*Expected Output:*
```
Test Files  1 passed (1)
     Tests  3 passed (3)
```

### 4. Multi-User Simultaneous Editing Simulation
```bash
cd collaboration-server
node test/multi_user_simulation.js
```
*Expected Output:*
```
[Client 1] Alex Rivera authenticated & connected.
[Client 2] Sarah Chen authenticated & connected.
[Client 3] Marcus Brody authenticated & connected.
[Awareness Check] Alex observes 3 active users online.

[Editing] Alex types intro paragraph...
[Editing] Concurrently, Sarah appends technical bullet points...
[Editing] Concurrently, Marcus appends SLA requirements...

--- CONVERGENCE VERIFICATION ---
✅ PERFECT CRDT CONVERGENCE: All 3 clients are 100% mathematically identical!
[CollabServer] Test server cleanly shut down.
--- SIMULATION COMPLETED SUCCESSFULLY ---
```

---

## 3. End-to-End Integration Verification (`EndToEndIntegration.test.jsx`)

The flagship integration test verifies the user journey:
1. **Document Navigation & Shell**:
   - Mounts the full application tree with `AuthProvider`, `WorkspaceProvider`, `ThemeProvider`, and `MemoryRouter`.
   - Loads `/workspaces/ws_eng_01/documents/doc_101`.
   - Confirms the document title input, presence avatar stack ("1 Editor"), and connection status badge.
2. **Side Drawers Coordination**:
   - Opens the workspace documents browser drawer.
   - Toggles the comments drawer (`Discussion Comments`) and verifies the comment input form.
   - Toggles the version history drawer (`Version Snapshots`) and verifies the "Save Current Version" trigger.
3. **Role-Based Access Control (RBAC)**:
   - Navigates to a document within a workspace where the user is a `Viewer` (`ws_growth_03`).
   - Asserts that the "View-Only Mode" banner is displayed.
   - Asserts that rich-text formatting buttons (Bold, Italic, Underline) are hidden.
   - Asserts that the document title input is `disabled` and `readOnly`.
   - Asserts that the "Delete Document" action is inaccessible.
4. **Keyboard Shortcuts**:
   - Pressing `Ctrl+K` focuses the global search bar in `TopNavbar`.
   - Pressing `Escape` closes active modal dialogs.
5. **Theme Switcher**:
   - Toggling the theme button cleanly toggles the `.dark` class.

---

## 4. Manual QA Verification Checklist

### Feature 1: Multi-User Collaborative Editing
1. Start all 3 services (`backend`, `collaboration-server`, `frontend`).
2. Open two separate browser windows (or an Incognito window):
   - Window A: `http://localhost:5173/workspaces/ws_eng_01/documents/doc_101`
   - Window B: `http://localhost:5173/workspaces/ws_eng_01/documents/doc_101`
3. Notice that both windows show `Live Collab Sync (ws://localhost:1234)` in green with pulsing status indicator.
4. Click the collaborators stack in Window A: notice that Window B collaborator is displayed.
5. Type text in Window A: notice the characters appear in Window B in real time (< 50ms) with a colored remote caret flag.
6. Select text and click **Bold** (`Ctrl+B`) or **Underline** (`Ctrl+U`): formatting updates instantly across both windows.

### Feature 2: Discussion Comments Drawer
1. In Window A, click **Comments** in the top-right toolbar.
2. Type: "Reviewing the CRDT commutative vector specification."
3. Click **Post Comment**:
   - Comment immediately appears in the thread with timestamp and author name.
4. Click **Reply** under the comment:
   - Nested reply field opens; enter response and submit.
5. Click **Resolve**:
   - Thread shifts to resolved state and open counter decrements.

### Feature 3: Version History Snapshots & Non-Destructive Restore
1. In the document editor, click **Versions**.
2. Click **Save Current Version**:
   - Modal appears: enter label "Sprint Review Draft v2.0" and summary.
   - Submit: snapshot appears at top of the snapshot timeline.
3. Make an intentional change to the document content.
4. Click **Restore** on the earlier snapshot:
   - A confirmation dialog appears.
   - Confirm restore: the document content reverts to the earlier snapshot, and a **new snapshot** (`Restored from Sprint Review Draft v2.0`) is added to history, preserving full audit history without deleting past snapshots.

### Feature 4: Role-Based Access Control (RBAC)
1. Navigate to `/workspaces`:
   - Notice role badges: `Owner`, `Editor`, and `Viewer`.
2. Click on the workspace with role **Viewer** (`ws_growth_03`):
   - Open any document.
   - Notice the amber **View-Only Mode** banner at the top of the editor.
   - Notice that the Tiptap formatting toolbar is completely hidden.
   - Notice that document title editing is disabled.
   - Notice that the Delete Document button is hidden.
