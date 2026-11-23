# SyncSpace – Database Schema Design (MySQL)

## 1. Schema Design Strategy

The SyncSpace database is fully normalized (3NF) to maintain referential integrity, eliminate data anomalies, and guarantee fast lookups for workspaces, memberships, and document revisions.

### Key Highlights
- **Primary Keys**: UUID / ULID or Auto-Increment IDs with indexed lookup identifiers.
- **Foreign Key Constraints**: `ON DELETE CASCADE` applied to child entities (e.g., deleting a workspace removes its documents and memberships; deleting a document removes its comments and version history).
- **Composite Indexes**: Added to high-frequency query filters such as `(workspace_id, is_favorite)` and `(document_id, created_at)`.
- **Role Constraints**: Enum constraints for `role` (`'owner'`, `'editor'`, `'viewer'`).

---

## 2. Table Definitions

```mermaid
erDiagram
    USERS ||--o{ WORKSPACE_MEMBERS : belongs_to
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : contains
    WORKSPACES ||--o{ DOCUMENTS : contains
    WORKSPACES ||--o{ INVITATIONS : sends
    DOCUMENTS ||--o{ COMMENTS : has
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : tracks
    COMMENTS ||--o{ COMMENT_REPLIES : nests
    USERS ||--o{ ACTIVITY_LOGS : performs
    USERS ||--o{ NOTIFICATIONS : receives

    USERS {
        VARCHAR id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR avatar_url
        DATETIME created_at
    }

    WORKSPACES {
        VARCHAR id PK
        VARCHAR name
        TEXT description
        VARCHAR tag
        VARCHAR icon
        VARCHAR owner_id FK
        DATETIME created_at
        DATETIME updated_at
    }

    WORKSPACE_MEMBERS {
        VARCHAR id PK
        VARCHAR workspace_id FK
        VARCHAR user_id FK
        ENUM role
        BOOLEAN is_favorite
        DATETIME joined_at
    }

    DOCUMENTS {
        VARCHAR id PK
        VARCHAR workspace_id FK
        VARCHAR title
        LONGTEXT content
        VARCHAR created_by FK
        DATETIME created_at
        DATETIME updated_at
    }

    DOCUMENT_VERSIONS {
        VARCHAR id PK
        VARCHAR document_id FK
        VARCHAR version_label
        LONGTEXT content_snapshot
        VARCHAR author_id FK
        TEXT change_summary
        DATETIME created_at
    }

    COMMENTS {
        VARCHAR id PK
        VARCHAR document_id FK
        VARCHAR author_id FK
        TEXT content
        BOOLEAN is_resolved
        DATETIME created_at
    }

    COMMENT_REPLIES {
        VARCHAR id PK
        VARCHAR comment_id FK
        VARCHAR author_id FK
        TEXT content
        DATETIME created_at
    }

    INVITATIONS {
        VARCHAR id PK
        VARCHAR workspace_id FK
        VARCHAR email
        ENUM role
        VARCHAR token UK
        ENUM status
        DATETIME expires_at
    }

    ACTIVITY_LOGS {
        VARCHAR id PK
        VARCHAR workspace_id FK
        VARCHAR user_id FK
        VARCHAR action_type
        TEXT description
        DATETIME created_at
    }

    NOTIFICATIONS {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR title
        TEXT message
        BOOLEAN is_read
        DATETIME created_at
    }
```

---

## 3. Initial SQL Schema File (`database/schema.sql`)

The ready-to-run schema file is maintained in [schema.sql](file:///c:/Users/ADMIN/Downloads/React%20SYNC/database/schema.sql).
