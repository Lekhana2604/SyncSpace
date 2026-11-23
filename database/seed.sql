-- =============================================================================
-- SyncSpace - Relational Database Seed Data (MySQL 8.0)
-- =============================================================================

USE syncspace_db;

-- 1. Seed Users (passwords hashed with bcrypt: 'password123')
INSERT INTO users (id, name, email, password_hash, avatar_url) VALUES
('usr_101', 'Alex Rivera', 'alex@syncspace.dev', '$2b$10$w8T9H696VvD8b14y0wB6IerP2kE4y49b4w530kS6hH.7d3FjB6KGe', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('usr_102', 'Sarah Chen', 'sarah@syncspace.dev', '$2b$10$w8T9H696VvD8b14y0wB6IerP2kE4y49b4w530kS6hH.7d3FjB6KGe', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
('usr_103', 'Marcus Brody', 'marcus@syncspace.dev', '$2b$10$w8T9H696VvD8b14y0wB6IerP2kE4y49b4w530kS6hH.7d3FjB6KGe', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('usr_104', 'Elena Rostova', 'elena@syncspace.dev', '$2b$10$w8T9H696VvD8b14y0wB6IerP2kE4y49b4w530kS6hH.7d3FjB6KGe', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Workspaces
INSERT INTO workspaces (id, name, description, tag, icon, owner_id) VALUES
('ws_eng_01', 'Core Engineering & Architecture', 'System specifications, microservices blueprints, and technical RFCs.', 'Engineering', 'Terminal', 'usr_101'),
('ws_prod_02', 'Product Design & Roadmap 2026', 'Quarterly OKRs, user journey maps, UX research notes, and sprint planning.', 'Product', 'Layers', 'usr_101'),
('ws_growth_03', 'Growth & Developer Relations', 'Developer documentation, launch playbooks, and partner onboarding guides.', 'Marketing', 'TrendingUp', 'usr_102'),
('ws_ops_04', 'Cloud Infrastructure & DevOps', 'Deployment guidelines, Docker compose manifests, and SLA incident logs.', 'Operations', 'Cloud', 'usr_103')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Seed Workspace Memberships
INSERT INTO workspace_members (id, workspace_id, user_id, role, is_favorite) VALUES
('wm_01', 'ws_eng_01', 'usr_101', 'Owner', TRUE),
('wm_02', 'ws_eng_01', 'usr_102', 'Editor', FALSE),
('wm_03', 'ws_eng_01', 'usr_103', 'Viewer', FALSE),
('wm_04', 'ws_prod_02', 'usr_101', 'Owner', TRUE),
('wm_05', 'ws_prod_02', 'usr_104', 'Editor', FALSE),
('wm_06', 'ws_growth_03', 'usr_101', 'Viewer', FALSE),
('wm_07', 'ws_ops_04', 'usr_101', 'Editor', FALSE)
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- 4. Seed Documents
INSERT INTO documents (id, workspace_id, title, content, created_by) VALUES
('doc_101', 'ws_eng_01', 'SyncSpace Architecture & WebSocket Synchronization Spec', '<h1>SyncSpace Architecture & WebSocket Synchronization Spec</h1><p>This document details the real-time collaboration pipeline integrating <strong>Yjs CRDTs</strong>, <strong>Hocuspocus WebSocket gateway</strong>, and persistent <u>MySQL relational storage</u>.</p><h2>1. Architectural Highlights</h2><ul><li><strong>Client State</strong>: Tiptap Editor bound to Y.Doc instance.</li><li><strong>Network Protocol</strong>: Binary WebSockets exchanging Yjs delta updates.</li><li><strong>Storage Mechanism</strong>: Snapshots serialized into MySQL version history tables.</li></ul><blockquote>Simultaneous editing by multiple team members reflects immediately with live carets and presence badges.</blockquote>', 'usr_101'),
('doc_102', 'ws_eng_01', 'MySQL 8.0 Relational Data Model & Indexing Strategy', '<h1>MySQL 8.0 Relational Data Model</h1><p>Schema definitions and InnoDB indexing strategies for high-concurrency multi-tenant operations.</p>', 'usr_101'),
('doc_201', 'ws_prod_02', 'Q3 Product Roadmap: Collaborative Productivity Platform', '<h1>Q3 Product Roadmap</h1><p>Strategic goals for launching real-time concurrent document collaboration.</p>', 'usr_101')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. Seed Document Revision Snapshots
INSERT INTO document_versions (id, document_id, version_label, content_snapshot, author_id, change_summary) VALUES
('ver_101', 'doc_101', 'v1.0 - Initial Specification', '<h1>Initial Architecture Draft</h1><p>Initial WebSocket and CRDT architectural notes.</p>', 'usr_101', 'Initial document draft created.'),
('ver_102', 'doc_101', 'v1.1 - CRDT Convergence Update', '<h1>SyncSpace Architecture Spec</h1><p>Added detailed Yjs commutative vector documentation.</p>', 'usr_102', 'Documented CRDT state vector math and convergence tests.')
ON DUPLICATE KEY UPDATE version_label=VALUES(version_label);

-- 6. Seed Comments
INSERT INTO comments (id, document_id, author_id, content, is_resolved) VALUES
('com_101', 'doc_101', 'usr_102', 'Should we document sub-50ms latency guarantees under high packet loss?', FALSE),
('com_102', 'doc_101', 'usr_103', 'Verified binary delta payload compression. Looks solid!', TRUE)
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- 7. Seed Comment Replies
INSERT INTO comment_replies (id, comment_id, author_id, content) VALUES
('rep_101', 'com_101', 'usr_101', 'Yes, adding simulation benchmarks from the automated multi-user tests.')
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- 8. Seed Notifications
INSERT INTO notifications (id, user_id, title, message, is_read, type) VALUES
('notif_101', 'usr_101', 'Welcome to SyncSpace', 'Your collaborative workspace is ready with real-time CRDT editing.', FALSE, 'system'),
('notif_102', 'usr_101', 'New Comment Thread', 'Sarah Chen commented on SyncSpace Architecture Spec.', FALSE, 'comment'),
('notif_103', 'usr_101', 'Version Snapshot Created', 'Version v1.1 - CRDT Convergence Update was saved.', TRUE, 'version')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 9. Seed Activity Logs
INSERT INTO activity_logs (id, workspace_id, user_id, action_type, description) VALUES
('act_101', 'ws_eng_01', 'usr_101', 'workspace_created', 'Created workspace Core Engineering & Architecture'),
('act_102', 'ws_eng_01', 'usr_101', 'document_created', 'Created document SyncSpace Architecture & WebSocket Synchronization Spec'),
('act_103', 'ws_eng_01', 'usr_102', 'version_saved', 'Saved version snapshot v1.1')
ON DUPLICATE KEY UPDATE description=VALUES(description);
