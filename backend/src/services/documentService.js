import { getPool, isFallback, getInMemoryStore } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Strips HTML tags to generate a plain-text excerpt for document previews.
 */
function generateExcerpt(htmlContent, maxLength = 120) {
  if (!htmlContent) return 'Empty document. Click to start typing...';
  const plainText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

/**
 * Verifies that the user has membership in the workspace.
 */
async function checkWorkspaceMembership(workspaceId, userId) {
  if (isFallback()) {
    const store = getInMemoryStore();
    return store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    ) || null;
  }

  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Lists all documents belonging to a workspace.
 */
export async function listDocumentsInWorkspace(workspaceId, userId) {
  const membership = await checkWorkspaceMembership(workspaceId, userId);
  if (!membership) {
    const error = new Error('Access denied: You do not have permission to view documents in this workspace.');
    error.status = 403;
    throw error;
  }

  if (isFallback()) {
    const store = getInMemoryStore();
    const docs = store.documents.filter((d) => d.workspace_id === workspaceId);

    return docs.map((doc) => {
      const creator = store.users.find((u) => u.id === doc.created_by);
      return {
        id: doc.id,
        workspaceId: doc.workspace_id,
        title: doc.title,
        excerpt: generateExcerpt(doc.content),
        content: doc.content,
        updatedAt: 'Recently updated',
        createdBy: creator?.name || 'Engineer',
        collaboratorsCount: 2,
        isFavorite: false,
      };
    });
  }

  const pool = getPool();
  const query = `
    SELECT 
      d.id,
      d.workspace_id AS workspaceId,
      d.title,
      d.content,
      d.created_by AS createdBy,
      u.name AS creatorName,
      d.updated_at AS updatedAt
    FROM documents d
    LEFT JOIN users u ON d.created_by = u.id
    WHERE d.workspace_id = ?
    ORDER BY d.updated_at DESC
  `;

  const [rows] = await pool.execute(query, [workspaceId]);
  return rows.map((r) => ({
    id: r.id,
    workspaceId: r.workspaceId,
    title: r.title,
    excerpt: generateExcerpt(r.content),
    content: r.content,
    updatedAt: r.updatedAt,
    createdBy: r.creatorName || 'Alex Rivera',
    collaboratorsCount: 2,
    isFavorite: false,
  }));
}

/**
 * Retrieves a single document by ID, verifying membership.
 */
export async function getDocumentById(documentId, userId) {
  if (isFallback()) {
    const store = getInMemoryStore();
    const doc = store.documents.find((d) => d.id === documentId);
    if (!doc) return null;

    const membership = await checkWorkspaceMembership(doc.workspace_id, userId);
    if (!membership) {
      const error = new Error('Access denied: You are not a member of this document\'s workspace.');
      error.status = 403;
      throw error;
    }

    const creator = store.users.find((u) => u.id === doc.created_by);
    return {
      id: doc.id,
      workspaceId: doc.workspace_id,
      title: doc.title,
      content: doc.content,
      excerpt: generateExcerpt(doc.content),
      createdBy: creator?.name || 'Alex Rivera',
      updatedAt: doc.updated_at,
      userRole: membership.role,
    };
  }

  const pool = getPool();
  const [docRows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [documentId]);
  if (docRows.length === 0) return null;

  const doc = docRows[0];
  const membership = await checkWorkspaceMembership(doc.workspace_id, userId);
  if (!membership) {
    const error = new Error('Access denied: You are not a member of this document\'s workspace.');
    error.status = 403;
    throw error;
  }

  const [userRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [doc.created_by]);

  return {
    id: doc.id,
    workspaceId: doc.workspace_id,
    title: doc.title,
    content: doc.content,
    excerpt: generateExcerpt(doc.content),
    createdBy: userRows[0]?.name || 'Alex Rivera',
    updatedAt: doc.updated_at,
    userRole: membership.role,
  };
}

/**
 * Creates a new document within a workspace.
 */
export async function createDocument({ workspaceId, title = 'Untitled Document', content = '', userId }) {
  const membership = await checkWorkspaceMembership(workspaceId, userId);
  if (!membership) {
    const error = new Error('Access denied: You are not a member of this workspace.');
    error.status = 403;
    throw error;
  }

  if (membership.role === 'Viewer') {
    const error = new Error('Permission denied: Viewers cannot create documents.');
    error.status = 403;
    throw error;
  }

  const id = `doc_${uuidv4().substring(0, 8)}`;
  const now = new Date();
  const cleanTitle = title.trim() || 'Untitled Document';

  if (isFallback()) {
    const store = getInMemoryStore();
    const newDoc = {
      id,
      workspace_id: workspaceId,
      title: cleanTitle,
      content: content || '<h1>' + cleanTitle + '</h1><p>Start writing collaborative content...</p>',
      created_by: userId,
      created_at: now,
      updated_at: now,
    };
    store.documents.unshift(newDoc);

    return {
      id: newDoc.id,
      workspaceId: newDoc.workspace_id,
      title: newDoc.title,
      content: newDoc.content,
      excerpt: generateExcerpt(newDoc.content),
      createdBy: 'You',
      updatedAt: 'Just now',
      collaboratorsCount: 1,
    };
  }

  const pool = getPool();
  const initialContent = content || `<h1>${cleanTitle}</h1><p>Start writing collaborative content...</p>`;

  await pool.execute(
    'INSERT INTO documents (id, workspace_id, title, content, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, workspaceId, cleanTitle, initialContent, userId, now, now]
  );

  return {
    id,
    workspaceId,
    title: cleanTitle,
    content: initialContent,
    excerpt: generateExcerpt(initialContent),
    createdBy: 'You',
    updatedAt: now,
    collaboratorsCount: 1,
  };
}

/**
 * Updates document title and/or rich-text content snapshot.
 */
export async function updateDocument(documentId, userId, { title, content }) {
  const doc = await getDocumentById(documentId, userId);
  if (!doc) {
    const error = new Error('Document not found.');
    error.status = 404;
    throw error;
  }

  if (doc.userRole === 'Viewer') {
    const error = new Error('Permission denied: Viewers cannot edit documents.');
    error.status = 403;
    throw error;
  }

  const now = new Date();

  if (isFallback()) {
    const store = getInMemoryStore();
    const target = store.documents.find((d) => d.id === documentId);
    if (title !== undefined) target.title = title.trim() || target.title;
    if (content !== undefined) target.content = content;
    target.updated_at = now;

    return {
      id: target.id,
      workspaceId: target.workspace_id,
      title: target.title,
      content: target.content,
      excerpt: generateExcerpt(target.content),
      updatedAt: 'Just now',
    };
  }

  const pool = getPool();
  await pool.execute(
    'UPDATE documents SET title = COALESCE(?, title), content = COALESCE(?, content), updated_at = NOW() WHERE id = ?',
    [title !== undefined ? title.trim() : null, content !== undefined ? content : null, documentId]
  );

  const [updatedRows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [documentId]);
  const updated = updatedRows[0];

  return {
    id: updated.id,
    workspaceId: updated.workspace_id,
    title: updated.title,
    content: updated.content,
    excerpt: generateExcerpt(updated.content),
    updatedAt: updated.updated_at,
  };
}

/**
 * Deletes a document (Owner or Editor).
 */
export async function deleteDocument(documentId, userId) {
  const doc = await getDocumentById(documentId, userId);
  if (!doc) {
    const error = new Error('Document not found.');
    error.status = 404;
    throw error;
  }

  if (doc.userRole === 'Viewer') {
    const error = new Error('Permission denied: Viewers cannot delete documents.');
    error.status = 403;
    throw error;
  }

  if (isFallback()) {
    const store = getInMemoryStore();
    store.documents = store.documents.filter((d) => d.id !== documentId);
    return { success: true };
  }

  const pool = getPool();
  await pool.execute('DELETE FROM documents WHERE id = ?', [documentId]);
  return { success: true };
}
