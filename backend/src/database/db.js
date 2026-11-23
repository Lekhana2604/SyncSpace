import mysql from 'mysql2/promise';
import config from '../config/env.js';
import { hashPassword } from '../utils/password.js';

let pool = null;
let isUsingFallback = false;

// In-Memory Relational Store (Fallback when MySQL daemon is offline)
const inMemoryStore = {
  users: [],
  workspaces: [],
  workspaceMembers: [],
  documents: [],
  documentVersions: [],
  invitations: [],
  comments: [],
  commentReplies: [],
  activityLogs: [],
  notifications: [],
};

/**
 * Initializes default mock seed data inside the in-memory fallback store.
 */
async function initInMemorySeed() {
  const defaultPasswordHash = await hashPassword('DemoPass123!');

  inMemoryStore.users = [
    {
      id: 'usr_101',
      name: 'Alex Rivera',
      email: 'alex.rivera@syncspace.dev',
      password_hash: defaultPasswordHash,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(),
    },
    {
      id: 'usr_102',
      name: 'Sarah Chen',
      email: 'sarah.chen@syncspace.dev',
      password_hash: defaultPasswordHash,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(),
    },
    {
      id: 'usr_103',
      name: 'Marcus Brody',
      email: 'marcus.brody@syncspace.dev',
      password_hash: defaultPasswordHash,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(),
    },
  ];

  inMemoryStore.workspaces = [
    {
      id: 'ws_eng_01',
      name: 'Core Engineering & Architecture',
      description: 'System specifications, microservices blueprints, and technical RFCs.',
      tag: 'Engineering',
      icon: 'Terminal',
      owner_id: 'usr_101',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'ws_prod_02',
      name: 'Product Design & Roadmap 2026',
      description: 'Quarterly OKRs, user journey maps, UX research notes, and sprint planning.',
      tag: 'Product',
      icon: 'Layers',
      owner_id: 'usr_101',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'ws_growth_03',
      name: 'Growth & Developer Relations',
      description: 'Developer documentation, launch playbooks, and partner onboarding guides.',
      tag: 'Marketing',
      icon: 'TrendingUp',
      owner_id: 'usr_102',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'ws_ops_04',
      name: 'Cloud Infrastructure & DevOps',
      description: 'Deployment guidelines, Docker compose manifests, and SLA incident logs.',
      tag: 'Operations',
      icon: 'Cloud',
      owner_id: 'usr_103',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  inMemoryStore.workspaceMembers = [
    { id: 'wm_1', workspace_id: 'ws_eng_01', user_id: 'usr_101', role: 'Owner', is_favorite: 1, joined_at: new Date() },
    { id: 'wm_2', workspace_id: 'ws_eng_01', user_id: 'usr_102', role: 'Editor', is_favorite: 0, joined_at: new Date() },
    { id: 'wm_3', workspace_id: 'ws_prod_02', user_id: 'usr_101', role: 'Owner', is_favorite: 1, joined_at: new Date() },
    { id: 'wm_4', workspace_id: 'ws_growth_03', user_id: 'usr_101', role: 'Viewer', is_favorite: 0, joined_at: new Date() },
    { id: 'wm_5', workspace_id: 'ws_ops_04', user_id: 'usr_101', role: 'Editor', is_favorite: 0, joined_at: new Date() },
  ];

  inMemoryStore.documents = [
    {
      id: 'doc_101',
      workspace_id: 'ws_eng_01',
      title: 'SyncSpace Architecture & WebSocket Synchronization Spec',
      content: '<h1>SyncSpace Architecture</h1><p>Full-stack collaborative spec.</p>',
      created_by: 'usr_101',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  inMemoryStore.invitations = [
    {
      id: 'inv_101',
      workspace_id: 'ws_eng_01',
      email: 'elena.rostova@syncspace.dev',
      role: 'Editor',
      token: 'invite_token_demo_101',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date(),
    },
  ];

  inMemoryStore.comments = [
    {
      id: 'comm_101',
      document_id: 'doc_101',
      author_id: 'usr_102',
      content: 'Should we configure Hocuspocus with SQLite or MySQL document update persistence for multi-node deployments?',
      is_resolved: 0,
      created_at: new Date(Date.now() - 3600000),
      updated_at: new Date(Date.now() - 3600000),
    },
    {
      id: 'comm_102',
      document_id: 'doc_101',
      author_id: 'usr_103',
      content: 'The CRDT convergence latency benchmark meets our sub-50ms SLA requirement.',
      is_resolved: 1,
      created_at: new Date(Date.now() - 7200000),
      updated_at: new Date(Date.now() - 1800000),
    },
  ];

  inMemoryStore.commentReplies = [
    {
      id: 'rep_101',
      comment_id: 'comm_101',
      author_id: 'usr_101',
      content: 'MySQL with connection pooling is configured and active in db.js for persistent binary updates!',
      created_at: new Date(Date.now() - 1800000),
    },
  ];

  inMemoryStore.activityLogs = [
    {
      id: 'act_101',
      workspace_id: 'ws_eng_01',
      user_id: 'usr_101',
      action_type: 'workspace_created',
      description: 'Created workspace Core Engineering & Architecture',
      created_at: new Date(Date.now() - 86400000),
    },
    {
      id: 'act_102',
      workspace_id: 'ws_eng_01',
      user_id: 'usr_102',
      action_type: 'member_joined',
      description: 'Sarah Chen joined as Editor',
      created_at: new Date(Date.now() - 43200000),
    },
    {
      id: 'act_103',
      workspace_id: 'ws_eng_01',
      user_id: 'usr_101',
      action_type: 'document_created',
      description: 'Created document SyncSpace Architecture & WebSocket Synchronization Spec',
      created_at: new Date(Date.now() - 21600000),
    },
    {
      id: 'act_104',
      workspace_id: 'ws_eng_01',
      user_id: 'usr_102',
      action_type: 'comment_created',
      description: 'Commented on SyncSpace Architecture & WebSocket Synchronization Spec',
      created_at: new Date(Date.now() - 3600000),
    },
  ];

  inMemoryStore.documentVersions = [
    {
      id: 'ver_101',
      document_id: 'doc_101',
      version_label: 'v1.0 - Initial Draft',
      content_snapshot: '<h1>SyncSpace Architecture</h1><p>Full-stack collaborative spec initial draft.</p>',
      author_id: 'usr_101',
      change_summary: 'Initial architecture RFC document created.',
      created_at: new Date(Date.now() - 86400000),
    },
    {
      id: 'ver_102',
      document_id: 'doc_101',
      version_label: 'v1.1 - Added WebSocket Specs',
      content_snapshot: '<h1>SyncSpace Architecture & WebSocket Synchronization Spec</h1><p>This document details the real-time collaboration pipeline integrating <strong>Yjs CRDTs</strong> and <strong>Hocuspocus WebSocket gateway</strong>.</p>',
      author_id: 'usr_102',
      change_summary: 'Added Hocuspocus WebSocket integration and Yjs update vector details.',
      created_at: new Date(Date.now() - 28800000),
    },
  ];

  inMemoryStore.notifications = [
    {
      id: 'notif_101',
      user_id: 'usr_101',
      title: 'New Member Joined',
      message: 'Sarah Chen accepted your invitation to join Core Engineering & Architecture.',
      is_read: 0,
      type: 'invitation',
      created_at: new Date(Date.now() - 43200000),
    },
    {
      id: 'notif_102',
      user_id: 'usr_101',
      title: 'New Comment on Document',
      message: 'Marcus Brody commented on "SyncSpace Architecture & WebSocket Synchronization Spec".',
      is_read: 0,
      type: 'comment',
      created_at: new Date(Date.now() - 3600000),
    },
    {
      id: 'notif_103',
      user_id: 'usr_101',
      title: 'System Milestone',
      message: 'Sub-50ms peer synchronization benchmark SLA verified successfully.',
      is_read: 1,
      type: 'system',
      created_at: new Date(Date.now() - 7200000),
    },
  ];
}

/**
 * Connects to MySQL. If MySQL is unavailable, falls back to in-memory store.
 */
export async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL at ${config.db.host}:${config.db.port}/${config.db.database}`);
    connection.release();
    isUsingFallback = false;
  } catch (err) {
    console.warn(`[Database] Notice: MySQL server is not reachable (${err.message}).`);
    console.warn(`[Database] Activating integrated in-memory relational store for Phase 2 development & testing.`);
    await initInMemorySeed();
    isUsingFallback = true;
  }
}

/**
 * Returns whether the database is running in fallback mode.
 */
export function isFallback() {
  return isUsingFallback;
}

/**
 * Returns the MySQL connection pool (or null if in fallback mode).
 */
export function getPool() {
  return pool;
}

/**
 * In-memory store accessor for fallback repository queries.
 */
export function getInMemoryStore() {
  return inMemoryStore;
}
