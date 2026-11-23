import { getPool, isFallback, getInMemoryStore } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Lists all workspaces that the user belongs to (as Owner, Editor, or Viewer),
 * including counts and favorite status.
 */
export async function listWorkspacesForUser(userId) {
  if (isFallback()) {
    const store = getInMemoryStore();
    const memberships = store.workspaceMembers.filter((wm) => wm.user_id === userId);

    return memberships.map((wm) => {
      const ws = store.workspaces.find((w) => w.id === wm.workspace_id) || {};
      const docCount = store.documents.filter((d) => d.workspace_id === ws.id).length;
      const memberCount = store.workspaceMembers.filter((m) => m.workspace_id === ws.id).length;

      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        tag: ws.tag,
        icon: ws.icon,
        ownerId: ws.owner_id,
        role: wm.role,
        isFavorite: Boolean(wm.is_favorite),
        documentsCount: docCount,
        membersCount: memberCount,
        updatedAt: 'Recently updated',
      };
    });
  }

  const pool = getPool();
  const query = `
    SELECT 
      w.id,
      w.name,
      w.description,
      w.tag,
      w.icon,
      w.owner_id AS ownerId,
      wm.role,
      wm.is_favorite AS isFavorite,
      (SELECT COUNT(*) FROM documents d WHERE d.workspace_id = w.id) AS documentsCount,
      (SELECT COUNT(*) FROM workspace_members m WHERE m.workspace_id = w.id) AS membersCount,
      w.updated_at AS updatedAt
    FROM workspaces w
    JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = ?
    ORDER BY wm.is_favorite DESC, w.updated_at DESC
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows.map((r) => ({
    ...r,
    isFavorite: Boolean(r.isFavorite),
  }));
}

/**
 * Retrieves single workspace details and verifies user has membership.
 */
export async function getWorkspaceById(workspaceId, userId) {
  if (isFallback()) {
    const store = getInMemoryStore();
    const membership = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );
    if (!membership) return null;

    const ws = store.workspaces.find((w) => w.id === workspaceId);
    if (!ws) return null;

    const docs = store.documents.filter((d) => d.workspace_id === workspaceId);
    const members = store.workspaceMembers
      .filter((m) => m.workspace_id === workspaceId)
      .map((m) => {
        const u = store.users.find((user) => user.id === m.user_id) || {};
        return {
          id: m.user_id,
          name: u.name || 'User',
          email: u.email || '',
          avatar: u.avatar_url,
          role: m.role,
          status: 'online',
        };
      });

    return {
      ...ws,
      role: membership.role,
      isFavorite: Boolean(membership.is_favorite),
      documents: docs,
      members,
    };
  }

  const pool = getPool();
  const [membershipRows] = await pool.execute(
    'SELECT role, is_favorite FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );

  if (membershipRows.length === 0) return null;

  const [wsRows] = await pool.execute('SELECT * FROM workspaces WHERE id = ?', [workspaceId]);
  if (wsRows.length === 0) return null;

  const [docRows] = await pool.execute(
    'SELECT id, title, updated_at FROM documents WHERE workspace_id = ? ORDER BY updated_at DESC',
    [workspaceId]
  );

  const [memberRows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.avatar_url AS avatar, wm.role, wm.joined_at 
     FROM workspace_members wm 
     JOIN users u ON wm.user_id = u.id 
     WHERE wm.workspace_id = ?`,
    [workspaceId]
  );

  return {
    ...wsRows[0],
    role: membershipRows[0].role,
    isFavorite: Boolean(membershipRows[0].is_favorite),
    documents: docRows,
    members: memberRows,
  };
}

/**
 * Creates a new workspace and sets the user as the Owner.
 */
export async function createWorkspace({ name, description = '', tag = 'Engineering', icon = 'FolderKanban', ownerId }) {
  const id = `ws_${uuidv4().substring(0, 8)}`;
  const now = new Date();

  if (isFallback()) {
    const store = getInMemoryStore();
    const newWs = {
      id,
      name,
      description,
      tag,
      icon,
      owner_id: ownerId,
      created_at: now,
      updated_at: now,
    };
    store.workspaces.unshift(newWs);

    // Add owner membership
    store.workspaceMembers.push({
      id: `wm_${uuidv4().substring(0, 8)}`,
      workspace_id: id,
      user_id: ownerId,
      role: 'Owner',
      is_favorite: 0,
      joined_at: now,
    });

    return {
      ...newWs,
      role: 'Owner',
      isFavorite: false,
      documentsCount: 0,
      membersCount: 1,
      updatedAt: 'Just now',
    };
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      'INSERT INTO workspaces (id, name, description, tag, icon, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description, tag, icon, ownerId, now, now]
    );

    await connection.execute(
      'INSERT INTO workspace_members (id, workspace_id, user_id, role, is_favorite, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
      [`wm_${uuidv4().substring(0, 8)}`, id, ownerId, 'Owner', false, now]
    );

    await connection.commit();

    return {
      id,
      name,
      description,
      tag,
      icon,
      ownerId,
      role: 'Owner',
      isFavorite: false,
      documentsCount: 0,
      membersCount: 1,
      updatedAt: 'Just now',
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Updates workspace properties (Owner only).
 */
export async function updateWorkspace(workspaceId, userId, { name, description, tag }) {
  if (isFallback()) {
    const store = getInMemoryStore();
    const membership = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );

    if (!membership || membership.role !== 'Owner') {
      const err = new Error('Unauthorized: Only workspace Owners can edit workspace details.');
      err.status = 403;
      throw err;
    }

    const ws = store.workspaces.find((w) => w.id === workspaceId);
    if (!ws) {
      const err = new Error('Workspace not found');
      err.status = 404;
      throw err;
    }

    if (name) ws.name = name;
    if (description !== undefined) ws.description = description;
    if (tag) ws.tag = tag;
    ws.updated_at = new Date();

    return ws;
  }

  const pool = getPool();
  const [membership] = await pool.execute(
    'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );

  if (membership.length === 0 || membership[0].role !== 'Owner') {
    const err = new Error('Unauthorized: Only workspace Owners can edit workspace details.');
    err.status = 403;
    throw err;
  }

  await pool.execute(
    'UPDATE workspaces SET name = COALESCE(?, name), description = COALESCE(?, description), tag = COALESCE(?, tag), updated_at = NOW() WHERE id = ?',
    [name || null, description || null, tag || null, workspaceId]
  );

  const [updated] = await pool.execute('SELECT * FROM workspaces WHERE id = ?', [workspaceId]);
  return updated[0];
}

/**
 * Deletes a workspace and its memberships (Owner only).
 */
export async function deleteWorkspace(workspaceId, userId) {
  if (isFallback()) {
    const store = getInMemoryStore();
    const membership = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );

    if (!membership || membership.role !== 'Owner') {
      const err = new Error('Unauthorized: Only the workspace Owner can delete this workspace.');
      err.status = 403;
      throw err;
    }

    store.workspaces = store.workspaces.filter((w) => w.id !== workspaceId);
    store.workspaceMembers = store.workspaceMembers.filter((wm) => wm.workspace_id !== workspaceId);
    store.documents = store.documents.filter((d) => d.workspace_id !== workspaceId);

    return { success: true };
  }

  const pool = getPool();
  const [membership] = await pool.execute(
    'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );

  if (membership.length === 0 || membership[0].role !== 'Owner') {
    const err = new Error('Unauthorized: Only the workspace Owner can delete this workspace.');
    err.status = 403;
    throw err;
  }

  await pool.execute('DELETE FROM workspaces WHERE id = ?', [workspaceId]);
  return { success: true };
}

/**
 * Toggles a user's favorite flag on a workspace.
 */
export async function toggleFavoriteWorkspace(workspaceId, userId) {
  if (isFallback()) {
    const store = getInMemoryStore();
    const membership = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );

    if (!membership) {
      const err = new Error('Workspace membership not found');
      err.status = 404;
      throw err;
    }

    membership.is_favorite = membership.is_favorite ? 0 : 1;
    return { workspaceId, isFavorite: Boolean(membership.is_favorite) };
  }

  const pool = getPool();
  await pool.execute(
    'UPDATE workspace_members SET is_favorite = NOT is_favorite WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );

  const [row] = await pool.execute(
    'SELECT is_favorite FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );

  return { workspaceId, isFavorite: Boolean(row[0]?.is_favorite) };
}
