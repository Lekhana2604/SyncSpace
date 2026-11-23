import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCollabServer } from '../src/server.js';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

const TEST_PORT = 1245;
const JWT_SECRET = 'syncspace_super_secret_jwt_key_2026';

describe('Real-Time Collaboration Server (Hocuspocus + Yjs)', () => {
  let server;
  let validToken;

  beforeAll(async () => {
    validToken = jwt.sign(
      { id: 'usr_test_1', name: 'Alice Collaborator', email: 'alice@syncspace.dev' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    server = createCollabServer({
      port: TEST_PORT,
      quiet: true,
    });

    await server.listen();
  });

  afterAll(async () => {
    if (server) {
      await server.destroy();
    }
  });

  it('authenticates and synchronizes Yjs document state between two collaborative peers', async () => {
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const docName = 'test-doc-collab-1';

    // Peer A connects
    const providerA = new HocuspocusProvider({
      url: `ws://localhost:${TEST_PORT}`,
      name: docName,
      document: docA,
      token: validToken,
      WebSocketPolyfill: WebSocket,
    });

    // Wait for provider A to connect and authenticate
    await new Promise((resolve) => {
      providerA.on('authenticated', resolve);
    });

    expect(providerA.isAuthenticated).toBe(true);

    // Peer B connects to same doc
    const providerB = new HocuspocusProvider({
      url: `ws://localhost:${TEST_PORT}`,
      name: docName,
      document: docB,
      token: validToken,
      WebSocketPolyfill: WebSocket,
    });

    await new Promise((resolve) => {
      providerB.on('authenticated', resolve);
    });

    // Peer A inserts text into Yjs XmlFragment or Text
    const textA = docA.getText('content');
    textA.insert(0, 'Hello from Collaborator Alice!');

    // Wait briefly for CRDT sync over WebSocket
    await new Promise((resolve) => setTimeout(resolve, 500));

    const textB = docB.getText('content');
    expect(textB.toString()).toBe('Hello from Collaborator Alice!');

    // Peer B inserts text at index 6
    textB.insert(6, 'and Bob ');

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Both peers should have identical convergent state
    expect(textA.toString()).toBe('Hello and Bob from Collaborator Alice!');
    expect(textB.toString()).toBe('Hello and Bob from Collaborator Alice!');

    // Clean up
    providerA.destroy();
    providerB.destroy();
  });

  it('rejects connection with an invalid token', async () => {
    const doc = new Y.Doc();
    let authFailed = false;

    const provider = new HocuspocusProvider({
      url: `ws://localhost:${TEST_PORT}`,
      name: 'secure-document-fail',
      document: doc,
      token: 'invalid-tampered-token',
      WebSocketPolyfill: WebSocket,
    });

    await new Promise((resolve) => {
      provider.on('authenticationFailed', () => {
        authFailed = true;
        resolve();
      });
      // Safety timeout
      setTimeout(resolve, 2000);
    });

    expect(authFailed).toBe(true);
    provider.destroy();
  });

  it('synchronizes user presence awareness between clients', async () => {
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const docName = 'awareness-test-doc';

    const providerA = new HocuspocusProvider({
      url: `ws://localhost:${TEST_PORT}`,
      name: docName,
      document: docA,
      token: validToken,
      WebSocketPolyfill: WebSocket,
    });

    const providerB = new HocuspocusProvider({
      url: `ws://localhost:${TEST_PORT}`,
      name: docName,
      document: docB,
      token: validToken,
      WebSocketPolyfill: WebSocket,
    });

    await Promise.all([
      new Promise((res) => providerA.on('authenticated', res)),
      new Promise((res) => providerB.on('authenticated', res)),
    ]);

    // Set awareness user on A
    providerA.setAwarenessField('user', {
      name: 'Alice',
      color: '#328565',
    });

    // Wait for awareness update on B
    await new Promise((resolve) => setTimeout(resolve, 500));

    const states = Array.from(providerB.awareness.getStates().values());
    const aliceState = states.find((s) => s.user?.name === 'Alice');

    expect(aliceState).toBeDefined();
    expect(aliceState.user.color).toBe('#328565');

    providerA.destroy();
    providerB.destroy();
  });
});
