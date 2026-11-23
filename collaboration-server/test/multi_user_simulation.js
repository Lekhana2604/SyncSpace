/**
 * Multi-User Simultaneous Collaborative Editing Verification Script
 * Simulates multiple real-time clients editing the same document over WebSockets
 * using HocuspocusProvider and Yjs CRDTs.
 */

import { createCollabServer } from '../src/server.js';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

const SIMULATION_PORT = 1290;
const JWT_SECRET = 'syncspace_super_secret_jwt_key_2026';

async function runMultiUserSimulation() {
  console.log('\n--- STARTING MULTI-USER SIMULTANEOUS COLLABORATION TEST ---\n');

  // 1. Start test collaboration server
  const server = createCollabServer({
    port: SIMULATION_PORT,
    quiet: true,
  });
  await server.listen();
  console.log(`[CollabServer] Listening on ws://localhost:${SIMULATION_PORT}`);

  // 2. Generate tokens for 3 distinct users
  const tokenAlex = jwt.sign(
    { id: 'usr_101', name: 'Alex Rivera', email: 'alex@syncspace.dev' },
    JWT_SECRET
  );
  const tokenSarah = jwt.sign(
    { id: 'usr_102', name: 'Sarah Chen', email: 'sarah@syncspace.dev' },
    JWT_SECRET
  );
  const tokenMarcus = jwt.sign(
    { id: 'usr_103', name: 'Marcus Brody', email: 'marcus@syncspace.dev' },
    JWT_SECRET
  );

  const docAlex = new Y.Doc();
  const docSarah = new Y.Doc();
  const docMarcus = new Y.Doc();
  const docId = 'doc_production_rfc_101';

  // 3. Connect Client 1 (Alex Rivera)
  console.log('[Client 1] Alex Rivera connecting to document...');
  const providerAlex = new HocuspocusProvider({
    url: `ws://localhost:${SIMULATION_PORT}`,
    name: docId,
    document: docAlex,
    token: tokenAlex,
    WebSocketPolyfill: WebSocket,
  });

  await new Promise((res) => providerAlex.on('authenticated', res));
  providerAlex.setAwarenessField('user', { id: 'usr_101', name: 'Alex Rivera', color: '#205C49' });
  console.log('[Client 1] Alex Rivera authenticated & connected.');

  // 4. Connect Client 2 (Sarah Chen)
  console.log('[Client 2] Sarah Chen connecting to document...');
  const providerSarah = new HocuspocusProvider({
    url: `ws://localhost:${SIMULATION_PORT}`,
    name: docId,
    document: docSarah,
    token: tokenSarah,
    WebSocketPolyfill: WebSocket,
  });

  await new Promise((res) => providerSarah.on('authenticated', res));
  providerSarah.setAwarenessField('user', { id: 'usr_102', name: 'Sarah Chen', color: '#328565' });
  console.log('[Client 2] Sarah Chen authenticated & connected.');

  // 5. Connect Client 3 (Marcus Brody)
  console.log('[Client 3] Marcus Brody connecting to document...');
  const providerMarcus = new HocuspocusProvider({
    url: `ws://localhost:${SIMULATION_PORT}`,
    name: docId,
    document: docMarcus,
    token: tokenMarcus,
    WebSocketPolyfill: WebSocket,
  });

  await new Promise((res) => providerMarcus.on('authenticated', res));
  providerMarcus.setAwarenessField('user', { id: 'usr_103', name: 'Marcus Brody', color: '#0284C7' });
  console.log('[Client 3] Marcus Brody authenticated & connected.');

  // Verify awareness contains all 3 users across all providers
  await new Promise((res) => setTimeout(res, 600));

  const statesAtAlex = Array.from(providerAlex.awareness.getStates().values());
  console.log(`[Awareness Check] Alex observes ${statesAtAlex.length} active users online.`);
  const activeNames = statesAtAlex.map((s) => s.user?.name).filter(Boolean);
  console.log(`[Active Users Online]: ${activeNames.join(', ')}`);

  if (activeNames.length < 3) {
    throw new Error('Expected 3 active users in awareness');
  }

  // 6. Simultaneous Edits
  console.log('\n[Editing] Alex types intro paragraph...');
  const textAlex = docAlex.getText('shared_content');
  textAlex.insert(0, 'SyncSpace RFC: Distributed CRDT Coordination Engine.\n');

  console.log('[Editing] Concurrently, Sarah appends technical bullet points...');
  await new Promise((res) => setTimeout(res, 300));
  const textSarah = docSarah.getText('shared_content');
  textSarah.insert(textSarah.length, '- Point 1: Yjs commutative update vectors.\n');

  console.log('[Editing] Concurrently, Marcus appends SLA requirements...');
  await new Promise((res) => setTimeout(res, 300));
  const textMarcus = docMarcus.getText('shared_content');
  textMarcus.insert(textMarcus.length, '- Point 2: Sub-50ms peer synchronization over WebSockets.\n');

  // Allow CRDT propagation
  await new Promise((res) => setTimeout(res, 800));

  // 7. Verify full convergence
  const finalAlex = textAlex.toString();
  const finalSarah = textSarah.toString();
  const finalMarcus = textMarcus.toString();

  console.log('\n--- CONVERGENCE VERIFICATION ---');
  console.log('Client 1 Content:\n' + finalAlex);
  console.log('Client 2 Content:\n' + finalSarah);
  console.log('Client 3 Content:\n' + finalMarcus);

  if (finalAlex === finalSarah && finalSarah === finalMarcus) {
    console.log('\n✅ PERFECT CRDT CONVERGENCE: All 3 clients are 100% mathematically identical!');
  } else {
    throw new Error('CRDT state did not converge identically!');
  }

  // Cleanup
  providerAlex.destroy();
  providerSarah.destroy();
  providerMarcus.destroy();
  await server.destroy();
  console.log('[CollabServer] Test server cleanly shut down.');
  console.log('\n--- SIMULATION COMPLETED SUCCESSFULLY ---\n');
  process.exit(0);
}

runMultiUserSimulation().catch((err) => {
  console.error('Simulation failed:', err);
  process.exit(1);
});
