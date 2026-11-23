import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { initDatabase } from '../src/database/db.js';

describe('SyncSpace Backend API - Phase 6 (Version History & Notifications)', () => {
  let token;

  beforeAll(async () => {
    await initDatabase();

    // Login as Alex Rivera
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.rivera@syncspace.dev',
        password: 'DemoPass123!',
      });

    token = res.body.token;
  });

  describe('Document Version History & Snapshots', () => {
    let createdVersionId;

    it('GET /api/documents/:documentId/versions lists all revision snapshots', async () => {
      const res = await request(app)
        .get('/api/documents/doc_101/versions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.versions)).toBe(true);
      expect(res.body.versions.length).toBeGreaterThanOrEqual(1);

      const v1 = res.body.versions.find((v) => v.version_label.includes('v1.0'));
      expect(v1).toBeDefined();
    });

    it('POST /api/documents/:documentId/versions creates a named historical snapshot', async () => {
      const res = await request(app)
        .post('/api/documents/doc_101/versions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          version_label: 'v2.0 - Multi-Node CRDT Architecture',
          change_summary: 'Upgraded CRDT coordination specs with Hocuspocus clustering.',
          content_snapshot: '<h1>SyncSpace v2.0 Architecture</h1><p>Clustered Yjs updates.</p>',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.version).toBeDefined();
      expect(res.body.version.version_label).toBe('v2.0 - Multi-Node CRDT Architecture');
      expect(res.body.version.author_name).toBe('Alex Rivera');

      createdVersionId = res.body.version.id;
    });

    it('GET /api/versions/:versionId fetches snapshot content', async () => {
      const res = await request(app)
        .get(`/api/versions/${createdVersionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.version.content_snapshot).toContain('Clustered Yjs updates');
    });

    it('POST /api/versions/:versionId/restore restores a snapshot by creating a new revision', async () => {
      const res = await request(app)
        .post(`/api/versions/${createdVersionId}/restore`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.newVersionId).toBeDefined();
      expect(res.body.newLabel).toContain('Restored from v2.0');
      expect(res.body.restoredContent).toContain('Clustered Yjs updates');

      // Verify that the restored version appears in the versions list
      const listRes = await request(app)
        .get('/api/documents/doc_101/versions')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.body.versions[0].version_label).toContain('Restored from v2.0');
    });
  });

  describe('User Notifications & Alerts', () => {
    let sampleNotifId;

    it('GET /api/notifications returns user alerts with unread counter', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
      expect(typeof res.body.unreadCount).toBe('number');

      sampleNotifId = res.body.notifications[0].id;
    });

    it('PATCH /api/notifications/:id/read marks notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${sampleNotifId}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/notifications/read-all marks all notifications as read', async () => {
      const res = await request(app)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(checkRes.body.unreadCount).toBe(0);
    });

    it('DELETE /api/notifications/:id dismisses notification', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${sampleNotifId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
