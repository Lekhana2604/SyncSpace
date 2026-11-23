import { getPool, isFallback, getInMemoryStore } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function findUserByEmail(email) {
  if (isFallback()) {
    const store = getInMemoryStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows.length > 0 ? rows[0] : null;
}

export async function findUserById(id) {
  if (isFallback()) {
    const store = getInMemoryStore();
    return store.users.find((u) => u.id === id) || null;
  }

  const pool = getPool();
  const [rows] = await pool.execute('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createUser({ name, email, passwordHash, avatarUrl = null }) {
  const id = `usr_${uuidv4().substring(0, 8)}`;
  const now = new Date();

  if (isFallback()) {
    const store = getInMemoryStore();
    const newUser = {
      id,
      name,
      email,
      password_hash: passwordHash,
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    };
    store.users.push(newUser);
    return newUser;
  }

  const pool = getPool();
  await pool.execute(
    'INSERT INTO users (id, name, email, password_hash, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, email, passwordHash, avatarUrl, now]
  );

  return { id, name, email, avatar_url: avatarUrl, created_at: now };
}
