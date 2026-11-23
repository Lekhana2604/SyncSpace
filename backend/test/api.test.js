import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabase } from '../src/database/db.js';

describe('SyncSpace Backend REST API - Phase 2', () => {
  let authToken = '';
  let testWorkspaceId = '';

  beforeAll(async () => {
    await initDatabase();
  });

  it('GET / returns welcome API index', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('SyncSpace Backend REST API');
    expect(res.body.status).toBe('online');
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/auth/login authenticates demo user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.rivera@syncspace.dev',
        password: 'DemoPass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alex.rivera@syncspace.dev');

    authToken = res.body.token;
  });

  it('POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.rivera@syncspace.dev',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me returns authenticated user profile with Bearer JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('alex.rivera@syncspace.dev');
  });

  it('GET /api/workspaces returns list of user workspaces', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.workspaces)).toBe(true);
    expect(res.body.workspaces.length).toBeGreaterThan(0);
  });

  it('POST /api/workspaces creates a new workspace and sets user as Owner', async () => {
    const res = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Backend Automated Test Workspace',
        description: 'Created during test run.',
        tag: 'Engineering',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.workspace.name).toBe('Backend Automated Test Workspace');
    expect(res.body.workspace.role).toBe('Owner');

    testWorkspaceId = res.body.workspace.id;
  });

  it('PATCH /api/workspaces/:id/favorite toggles favorite status', async () => {
    const res = await request(app)
      .patch(`/api/workspaces/${testWorkspaceId}/favorite`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isFavorite).toBe(true);
  });

  let createdDocId = '';

  it('POST /api/workspaces/:workspaceId/documents creates a new document', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${testWorkspaceId}/documents`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Microservices Architecture Draft',
        content: '<h1>Draft</h1><p>Initial microservices specification.</p>',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.document.title).toBe('Microservices Architecture Draft');
    expect(res.body.document.workspaceId).toBe(testWorkspaceId);

    createdDocId = res.body.document.id;
  });

  it('GET /api/workspaces/:workspaceId/documents lists documents in workspace', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${testWorkspaceId}/documents`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents.length).toBeGreaterThan(0);
    expect(res.body.documents[0].id).toBe(createdDocId);
  });

  it('GET /api/documents/:id retrieves document details', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document.title).toBe('Microservices Architecture Draft');
  });

  it('PUT /api/documents/:id saves updated title and rich-text content', async () => {
    const res = await request(app)
      .put(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Updated Microservices Architecture',
        content: '<h1>Updated</h1><p>Formatted with bold and underline.</p>',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document.title).toBe('Updated Microservices Architecture');
    expect(res.body.document.content).toContain('Formatted with bold');
  });

  it('DELETE /api/documents/:id removes document successfully', async () => {
    const res = await request(app)
      .delete(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
