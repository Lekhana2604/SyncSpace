# SyncSpace – API & Network Protocols Documentation

SyncSpace employs a dual-network architecture:
1. **REST API (JSON over HTTP/HTTPS)** on `http://localhost:5000/api` for authentication, workspace management, member roles, metadata, comments, version snapshots, and notifications.
2. **WebSocket Gateway (Binary Yjs deltas over WS/WSS)** on `ws://localhost:1234` for sub-50ms peer-to-peer real-time document synchronization and presence carets.

Protected REST endpoints require:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new user and generates a JWT.
- **Request Body**:
  ```json
  {
    "name": "Sarah Chen",
    "email": "sarah@syncspace.dev",
    "password": "SecurePassword123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "user": { "id": "usr_102", "name": "Sarah Chen", "email": "sarah@syncspace.dev" },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### `POST /api/auth/login`
Authenticates with email and password.
- **Response `200 OK`**: User profile and JWT token.

### `GET /api/auth/me`
Retrieves authenticated user profile.

---

## 2. Workspace Endpoints

### `GET /api/workspaces`
Lists all workspaces accessible by the user with role badges (`Owner`, `Editor`, `Viewer`), member counts, document counts, and favorite status.

### `POST /api/workspaces`
Creates a new workspace, assigning the creator as `Owner`.
- **Request Body**:
  ```json
  {
    "name": "Core Engineering & Architecture",
    "description": "System blueprints and technical RFCs.",
    "tag": "Engineering"
  }
  ```

### `GET /api/workspaces/:id`
Retrieves single workspace metadata, member list, and document summaries.

### `PATCH /api/workspaces/:id/favorite`
Toggles starred favorite status for the current user.

### `PUT /api/workspaces/:id`
Updates workspace name, description, or category (Owner only).

### `DELETE /api/workspaces/:id`
Deletes workspace and cascades deletion to all documents and versions (Owner only).

---

## 3. Document Endpoints

### `GET /api/workspaces/:workspaceId/documents`
Lists all documents in the workspace.

### `POST /api/workspaces/:workspaceId/documents`
Creates a new document in the workspace.

### `GET /api/documents/:id`
Retrieves document metadata, author, and current HTML content.

### `PUT /api/documents/:id`
Autosave endpoint: saves updated title and rich-text HTML content to MySQL.

### `DELETE /api/documents/:id`
Deletes document (Owner and Editor only).

---

## 4. Team & Invitations Pipeline

### `GET /api/workspaces/:workspaceId/members`
Lists all workspace members with their roles and avatars.

### `PUT /api/workspaces/:workspaceId/members/:targetUserId`
Updates a member's role (`Editor` <-> `Viewer`). Rejects modifying the `Owner`.

### `DELETE /api/workspaces/:workspaceId/members/:targetUserId`
Removes a member from the workspace (Owner only).

### `POST /api/workspaces/:workspaceId/invitations`
Generates a pending invitation with a unique UUID token.
- **Request Body**:
  ```json
  {
    "email": "colleague@company.com",
    "role": "Editor"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "invitation": {
      "id": "inv_101",
      "email": "colleague@company.com",
      "token": "49bf32b1-5e26-4076-a496-e2a1fb4284b8",
      "inviteLink": "http://localhost:5173/invite/49bf32b1-5e26-4076-a496-e2a1fb4284b8"
    }
  }
  ```

### `GET /api/invitations/:token`
Public endpoint returning workspace name, inviter, and invited role for the acceptance card.

### `POST /api/invitations/:token/accept`
Accepts invitation and joins the authenticated user to the workspace.

---

## 5. In-Document Comments & Discussions

### `GET /api/documents/:documentId/comments`
Retrieves all comments with nested reply arrays and author details.

### `POST /api/documents/:documentId/comments`
Posts a new discussion comment on the document.
- **Request Body**: `{ "content": "Let's review the sub-50ms latency benchmarks." }`

### `POST /api/comments/:commentId/replies`
Posts a reply to an existing comment.

### `PATCH /api/comments/:commentId/resolve`
Toggles resolved/open status of a comment thread.

### `DELETE /api/comments/:commentId`
Deletes a comment (Author or Workspace Owner).

---

## 6. Version History & Non-Destructive Restore

### `GET /api/documents/:documentId/versions`
Lists all historical snapshots for a document in reverse chronological order.

### `POST /api/documents/:documentId/versions`
Creates an explicit named revision snapshot with a change summary.

### `GET /api/versions/:versionId`
Retrieves the snapshot content for preview modal comparison.

### `POST /api/versions/:versionId/restore`
Restores a past snapshot non-destructively:
1. Fetches snapshot content from `document_versions`.
2. Updates `documents.content` to the snapshot content.
3. Inserts a **new** revision snapshot labeled `Restored from <version_label>`.
4. Returns the restored document state without erasing past history.

---

## 7. Notifications & Activity Logs

### `GET /api/notifications`
Returns user notifications with unread counter.

### `PATCH /api/notifications/:id/read`
Marks an individual notification as read.

### `POST /api/notifications/read-all`
Marks all notifications for the user as read.

### `DELETE /api/notifications/:id`
Dismisses a notification.

### `GET /api/workspaces/:workspaceId/activity`
Returns the recent audit log stream for the workspace.

---

## 8. Real-Time WebSocket Collaboration Protocol (Hocuspocus)

- **WebSocket URL**: `ws://localhost:1234`
- **Document Namespace**: `doc_<documentId>` (e.g. `doc_doc_101`)

### Handshake & Authentication Flow:
1. Client connects with `@hocuspocus/provider`:
   ```javascript
   new HocuspocusProvider({
     url: 'ws://localhost:1234',
     name: 'doc_101',
     document: ydoc,
     token: localStorage.getItem('syncspace_token')
   });
   ```
2. Server executes `onAuthenticate({ token, documentName })`:
   - Validates JWT signature with `JWT_SECRET`.
   - Attaches user context (`user.id`, `user.name`) to connection session.
3. Server executes `onLoadDocument({ documentName })`:
   - Checks MySQL `yjs_documents` table for stored binary state vector.
   - If found, loads binary state into `Y.Doc`.
   - If not found, initializes new document instance.
4. Client and Server exchange commutative Yjs update vectors.
5. In-flight edits trigger `onStoreDocument({ documentName, document })`:
   - Encodes state vector via `Y.encodeStateAsUpdate(document)`.
   - Persists binary blob to MySQL `yjs_documents` table (`LONGBLOB`).

### Awareness Protocol:
- Client broadcasts presence awareness: `{ id, name, color, avatar }`.
- Remote clients listen to `awarenessUpdate` events and render colored caret flags in Tiptap.
