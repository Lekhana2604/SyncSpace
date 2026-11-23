# SyncSpace – React.js Syllabus Mapping

This document provides a comprehensive, verified mapping of each unit and topic in the academic React.js syllabus to its real implementation in the SyncSpace repository.

---

## Unit I: Introduction to React and JSX

| Topic | Description & Implementation Details | Codebase Reference Link |
| :--- | :--- | :--- |
| **React Features** | Declarative components, Virtual DOM reconciliation, unidirectional data flow. | [App.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/App.jsx) |
| **Component Architecture** | Modular atomic breakdown (`common/`, `layout/`, `dashboard/`, `pages/`). | [frontend/src/components/](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components) |
| **Declarative UI** | State-driven rendering without imperative DOM manipulation. | [DashboardPage.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/DashboardPage.jsx) |
| **Virtual DOM Concepts** | Explanation and interactive demonstration of in-memory diffing tree. | [ReactConceptsPage.jsx#L140-L165](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L140-L165) |
| **JSX Syntax & Expressions** | Embedded JavaScript expressions inside JSX curly braces `{ ... }`. | [ReactConceptsPage.jsx#L125-L135](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L125-L135) |
| **Conditional Rendering** | Ternary operators, short-circuit `&&`, modal and drawer visibility toggles. | [Modal.jsx#L34-L70](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/common/Modal.jsx#L34-L70) |
| **List Rendering with Keys** | Dynamic iteration over arrays with unique item IDs (`key={ws.id}`). | [DashboardPage.jsx#L85-L115](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/DashboardPage.jsx#L85-L115) |
| **Vite Project Setup** | Fast ES modules bundler configuration with React plugin. | [vite.config.js](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/vite.config.js) |

---

## Unit II: Components, Props and State

| Topic | Description & Implementation Details | Codebase Reference Link |
| :--- | :--- | :--- |
| **Functional Components** | Modern React components utilizing hooks and Tiptap editor engine. | [Button.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/common/Button.jsx) & [DocumentEditorPage.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/DocumentEditorPage.jsx) |
| **Reusable Components** | Generalized UI primitives (`Button`, `Card`, `Badge`, `Modal`, `Input`). | [common/](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/common) |
| **Props & Children Prop** | Data transfer from parent to child; container slots via `props.children`. | [Card.jsx#L8-L20](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/common/Card.jsx#L8-L20) |
| **Props vs State** | Clear separation between immutable inputs and mutable local states. | [ReactConceptsPage.jsx#L185-L215](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L185-L215) |
| **React Fragments** | Grouping child elements without adding extra DOM nodes (`<>...</>`). | [Sidebar.jsx#L170-L185](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/layout/Sidebar.jsx#L170-L185) |
| **useState Hook** | Local state tracking across interactive toggles, filters, and forms. | [DashboardPage.jsx#L30-L45](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/DashboardPage.jsx#L30-L45) |
| **Class Components** | Understanding legacy class architecture (`React.Component`). | [ReactConceptsPage.jsx#L20-L65](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L20-L65) |
| **this.props & this.props.children** | Class component property access and transclusion. | [ReactConceptsPage.jsx#L46-L56](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L46-L56) |
| **bind() Method** | Explicit class method lexical binding in constructor. | [ReactConceptsPage.jsx#L30-L35](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L30-L35) |

---

## Unit III: Events and Form Handling

| Topic | Description & Implementation Details | Codebase Reference Link |
| :--- | :--- | :--- |
| **SyntheticEvent** | React cross-browser event wrappers (`e.preventDefault()`, `e.stopPropagation()`). | [WorkspaceCard.jsx#L45-L55](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/dashboard/WorkspaceCard.jsx#L45-L55) |
| **Controlled Components** | Form inputs whose value is bound to React state with `onChange`. | [Input.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/common/Input.jsx) |
| **Uncontrolled Components** | Accessing raw DOM inputs using `useRef()` without re-rendering. | [ReactConceptsPage.jsx#L235-L260](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L235-L260) |
| **Form Handling & Validation** | Email format verification, required fields, and password checks with async API integration. | [LoginPage.jsx#L15-L35](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/LoginPage.jsx#L15-L35) & [TeamPage.jsx#L80-L120](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/TeamPage.jsx#L80-L120) |
| **Lifting State Up** | Modal state and new workspace creation lifted to layout shell. | [AppLayout.jsx#L25-L45](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/layout/AppLayout.jsx#L25-L45) |

---

## Unit IV: Routing and React DevTools

| Topic | Description & Implementation Details | Codebase Reference Link |
| :--- | :--- | :--- |
| **BrowserRouter & Routes** | Client-side routing tree definitions. | [App.jsx#L40-L75](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/App.jsx#L40-L75) |
| **Route & Nested Layouts** | Outlet component for persistent layout shells with inner pages. | [AppLayout.jsx#L45-L60](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/layout/AppLayout.jsx#L45-L60) |
| **NavLink (Active Highlighting)** | Forest-green styling applied automatically to active routes. | [Sidebar.jsx#L45-L65](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/layout/Sidebar.jsx#L45-L65) |
| **useParams Hook** | Dynamic URL parameters (`:workspaceId`, `:documentId`, `:token` for invitations). | [WorkspaceDetailPage.jsx#L20-L28](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/WorkspaceDetailPage.jsx#L20-L28) & [AcceptInvitePage.jsx#L20-L30](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/AcceptInvitePage.jsx#L20-L30) |
| **useNavigate Hook** | Programmatic navigation between routes upon actions. | [LoginPage.jsx#L20-L30](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/LoginPage.jsx#L20-L30) |

---

## Unit V: Hooks, Styling and Deployment

| Topic | Description & Implementation Details | Codebase Reference Link |
| :--- | :--- | :--- |
| **useEffect Hook** | Side effects: theme synchronizer, Escape key listeners, simulated autosave. | [ThemeContext.jsx#L25-L35](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/context/ThemeContext.jsx#L25-L35) |
| **useRef Hook** | DOM references for focus control (`Ctrl+K`) and click-outside dismissal. | [TopNavbar.jsx#L35-L55](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/layout/TopNavbar.jsx#L35-L55) |
| **React Context API** | Global theme, auth, and workspace state providers (`useTheme`, `useAuth`, `useWorkspaces`). | [ThemeContext.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/context/ThemeContext.jsx) & [WorkspaceContext.jsx](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/context/WorkspaceContext.jsx) |
| **useReducer Hook** | Complex state transitions demonstrated with reducer actions. | [ReactConceptsPage.jsx#L70-L85](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/ReactConceptsPage.jsx#L70-L85) |
| **useMemo Hook** | Memoized singleton lifecycle management of Yjs `Y.Doc` and `HocuspocusProvider` WebSocket client to prevent redundant re-instantiations. | [CollaborativeEditor.jsx#L95-L135](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/editor/CollaborativeEditor.jsx#L95-L135) |
| **Key Reconciliation** | Resetting component state and isolated collaborative sessions when navigating across entities using dynamic React keys (`key={documentId}`). | [DocumentEditorPage.jsx#L320-L335](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/pages/DocumentEditorPage.jsx#L320-L335) |
| **Real-Time Event Subscriptions** | Managing WebSocket event subscriptions and awareness lifecycle inside `useEffect` with proper cleanup teardown (`provider.destroy()`, `ydoc.destroy()`). | [CollaborativeEditor.jsx#L140-L185](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/src/components/editor/CollaborativeEditor.jsx#L140-L185) |
| **Tailwind CSS Design Tokens** | Forest green color tokens and dark mode surface classes. | [tailwind.config.js](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/tailwind.config.js) |
| **Production Build** | Clean Vite production asset generation. | [vite.config.js](file:///c:/Users/ADMIN/Downloads/React%20SYNC/frontend/vite.config.js) |
