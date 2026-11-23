import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { initDatabase } from '../src/database/db.js';

describe('SyncSpace Backend API - Phase 5 (Team, Invitations, Comments, Activity)', () => {
  let token;

  beforeAll(async () => {
    await initDatabase();

    // Login as default demo user Alex Rivera (Owner)
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.rivera@syncspace.dev',
        password: 'DemoPass123!',
      });

    token = res.body.token;
  });

  describe('Team Members & Role Management', () => {
    it('GET /api/workspaces/:workspaceId/members lists all workspace members', async () => {
      const res = await request(app)
        .get('/api/workspaces/ws_eng_01/members')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.members)).toBe(true);
      expect(res.body.members.length).toBeGreaterThanOrEqual(1);

      const owner = res.body.members.find((m) => m.role === 'Owner');
      expect(owner).toBeDefined();
      expect(owner.name).toBe('Alex Rivera');
    });

    it('PUT /api/workspaces/:workspaceId/members/:targetUserId updates member role', async () => {
      const res = await request(app)
        .put('/api/workspaces/ws_eng_01/members/usr_102')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'Viewer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Role updated to Viewer');
    });

    it('rejects changing the role of workspace Owner', async () => {
      const res = await request(app)
        .put('/api/workspaces/ws_eng_01/members/usr_101')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'Editor' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot change the role of the workspace owner');
    });
  });

  describe('Invitations Pipeline', () => {
    let createdToken;

    it('POST /api/workspaces/:workspaceId/invitations creates a pending invitation', async () => {
      const res = await request(app)
        .post('/api/workspaces/ws_eng_01/invitations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'new.engineer@syncspace.dev',
          role: 'Editor',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.invitation).toBeDefined();
      expect(res.body.invitation.email).toBe('new.engineer@syncspace.dev');
      expect(res.body.invitation.role).toBe('Editor');
      expect(res.body.inviteUrl).toContain('/invite/');

      createdToken = res.body.invitation.token;
    });

    it('GET /api/invitations/:token fetches public invitation metadata', async () => {
      const res = await request(app).get(`/api/invitations/${createdToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.invitation.workspace_name).toBeDefined();
      expect(res.body.invitation.role).toBe('Editor');
    });

    it('POST /api/invitations/:token/accept accepts invitation into workspace', async () => {
      // Login as Marcus Brody
      const marcusLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'marcus.brody@syncspace.dev',
          password: 'DemoPass123!',
        });
      const marcusToken = marcusLogin.body.token;

      const res = await request(app)
        .post(`/api/invitations/${createdToken}/accept`)
        .set('Authorization', `Bearer ${marcusToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.workspaceId).toBe('ws_eng_01');
    });
  });

  describe('In-Document Comments & Discussion Threads', () => {
    let commentId;

    it('GET /api/documents/:documentId/comments returns comments with nested replies', async () => {
      const res = await request(app)
        .get('/api/documents/doc_101/comments')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBeGreaterThanOrEqual(1);

      const commWithReplies = res.body.comments.find((c) => c.replies && c.replies.length > 0);
      expect(commWithReplies).toBeDefined();
    });

    it('POST /api/documents/:documentId/comments creates a new discussion comment', async () => {
      const res = await request(app)
        .post('/api/documents/doc_101/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Let us confirm the Yjs awareness throttle rate is set to 2000ms.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.comment.content).toBe('Let us confirm the Yjs awareness throttle rate is set to 2000ms.');
      expect(res.body.comment.author_name).toBe('Alex Rivera');

      commentId = res.body.comment.id;
    });

    it('POST /api/comments/:commentId/replies posts a reply to an existing comment', async () => {
      const res = await request(app)
        .post(`/api/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Confirmed, Hocuspocus debouncing is 2000ms by default.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.reply.content).toContain('Confirmed, Hocuspocus debouncing');
    });

    it('PATCH /api/comments/:commentId/resolve toggles resolution status', async () => {
      const res = await request(app)
        .patch(`/api/comments/${commentId}/resolve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.is_resolved).toBe(true);
    });
  });

  describe('Workspace Activity Audit Logs', () => {
    it('GET /api/workspaces/:workspaceId/activity returns recent activity logs', async () => {
      const res = await request(app)
        .get('/api/workspaces/ws_eng_01/activity')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.activities)).toBe(true);
      expect(res.body.activities.length).toBeGreaterThanOrEqual(1);
    });
  });
});
