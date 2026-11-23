import { isFallback, getPool, getInMemoryStore } from '../database/db.js';

/**
 * Controller for Document Version History & Historical Snapshots
 */

// 1. List all historical snapshots for a document
export async function getDocumentVersions(req, res, next) {
  try {
    const { documentId } = req.params;

    if (!isFallback()) {
      const pool = getPool();
      const [versions] = await pool.query(
        `SELECT v.id, v.document_id, v.version_label, v.change_summary, v.created_at, v.author_id,
                u.name AS author_name, u.avatar_url AS author_avatar
         FROM document_versions v
         JOIN users u ON v.author_id = u.id
         WHERE v.document_id = ?
         ORDER BY v.created_at DESC`,
        [documentId]
      );
      return res.status(200).json({ success: true, versions });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const versions = store.documentVersions
      .filter((v) => v.document_id === documentId)
      .map((v) => {
        const u = store.users.find((user) => user.id === v.author_id) || {};
        return {
          id: v.id,
          document_id: v.document_id,
          version_label: v.version_label,
          change_summary: v.change_summary,
          created_at: v.created_at,
          author_id: v.author_id,
          author_name: u.name || 'Team Member',
          author_avatar: u.avatar_url || null,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ success: true, versions });
  } catch (err) {
    next(err);
  }
}

// 2. Get specific version content snapshot
export async function getVersionById(req, res, next) {
  try {
    const { versionId } = req.params;

    if (!isFallback()) {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT v.*, u.name AS author_name, u.avatar_url AS author_avatar
         FROM document_versions v
         JOIN users u ON v.author_id = u.id
         WHERE v.id = ?`,
        [versionId]
      );
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Version snapshot not found.' });
      }
      return res.status(200).json({ success: true, version: rows[0] });
    }

    const store = getInMemoryStore();
    const v = store.documentVersions.find((ver) => ver.id === versionId);
    if (!v) {
      return res.status(404).json({ success: false, message: 'Version snapshot not found.' });
    }
    const u = store.users.find((user) => user.id === v.author_id) || {};

    return res.status(200).json({
      success: true,
      version: {
        ...v,
        author_name: u.name || 'Team Member',
        author_avatar: u.avatar_url || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// 3. Create a named snapshot
export async function createVersionSnapshot(req, res, next) {
  try {
    const { documentId } = req.params;
    const { version_label, change_summary, content_snapshot } = req.body;
    const authorId = req.user.id;

    if (!version_label || !version_label.trim()) {
      return res.status(400).json({ success: false, message: 'Version label is required.' });
    }

    const versionId = `ver_${Date.now()}`;

    if (!isFallback()) {
      const pool = getPool();

      // Determine content to snapshot: use passed content or fetch current document content
      let snapshotContent = content_snapshot;
      if (!snapshotContent) {
        const [doc] = await pool.query('SELECT content FROM documents WHERE id = ?', [documentId]);
        if (!doc || doc.length === 0) {
          return res.status(404).json({ success: false, message: 'Document not found.' });
        }
        snapshotContent = doc[0].content || '';
      }

      await pool.query(
        `INSERT INTO document_versions (id, document_id, version_label, content_snapshot, author_id, change_summary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [versionId, documentId, version_label.trim(), snapshotContent, authorId, change_summary?.trim() || '']
      );

      const [created] = await pool.query(
        `SELECT v.*, u.name AS author_name, u.avatar_url AS author_avatar
         FROM document_versions v
         JOIN users u ON v.author_id = u.id
         WHERE v.id = ?`,
        [versionId]
      );

      return res.status(201).json({ success: true, version: created[0] });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    let snapshotContent = content_snapshot;
    if (!snapshotContent) {
      const doc = store.documents.find((d) => d.id === documentId);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }
      snapshotContent = doc.content || '';
    }

    const author = store.users.find((u) => u.id === authorId) || { name: req.user.name };
    const newVersion = {
      id: versionId,
      document_id: documentId,
      version_label: version_label.trim(),
      content_snapshot: snapshotContent,
      author_id: authorId,
      author_name: author.name || 'Team Member',
      author_avatar: author.avatar_url || null,
      change_summary: change_summary?.trim() || '',
      created_at: new Date(),
    };
    store.documentVersions.unshift(newVersion);

    return res.status(201).json({ success: true, version: newVersion });
  } catch (err) {
    next(err);
  }
}

// 4. Restore a historical snapshot (creates a NEW version snapshot)
export async function restoreVersionSnapshot(req, res, next) {
  try {
    const { versionId } = req.params;
    const authorId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM document_versions WHERE id = ?', [versionId]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Target version not found.' });
      }

      const targetVersion = rows[0];
      const documentId = targetVersion.document_id;

      // 1. Update the document's active content in documents table
      await pool.query('UPDATE documents SET content = ?, updated_at = NOW() WHERE id = ?', [
        targetVersion.content_snapshot,
        documentId,
      ]);

      // 2. Create a new version snapshot to preserve complete historical audit trail
      const newVersionId = `ver_${Date.now()}`;
      const newLabel = `Restored from ${targetVersion.version_label}`;
      const summary = `Restored content snapshot originally created on ${new Date(targetVersion.created_at).toLocaleDateString()}`;

      await pool.query(
        `INSERT INTO document_versions (id, document_id, version_label, content_snapshot, author_id, change_summary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newVersionId, documentId, newLabel, targetVersion.content_snapshot, authorId, summary]
      );

      return res.status(200).json({
        success: true,
        message: 'Snapshot restored successfully as a new version.',
        restoredContent: targetVersion.content_snapshot,
        newVersionId,
        newLabel,
      });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const targetVersion = store.documentVersions.find((v) => v.id === versionId);
    if (!targetVersion) {
      return res.status(404).json({ success: false, message: 'Target version not found.' });
    }

    const doc = store.documents.find((d) => d.id === targetVersion.document_id);
    if (doc) {
      doc.content = targetVersion.content_snapshot;
      doc.updated_at = new Date();
    }

    const newVersionId = `ver_${Date.now()}`;
    const newLabel = `Restored from ${targetVersion.version_label}`;
    const summary = `Restored content snapshot originally created on ${new Date(targetVersion.created_at).toLocaleDateString()}`;

    const author = store.users.find((u) => u.id === authorId) || { name: req.user.name };
    const newVersion = {
      id: newVersionId,
      document_id: targetVersion.document_id,
      version_label: newLabel,
      content_snapshot: targetVersion.content_snapshot,
      author_id: authorId,
      author_name: author.name || 'Team Member',
      author_avatar: author.avatar_url || null,
      change_summary: summary,
      created_at: new Date(),
    };
    store.documentVersions.unshift(newVersion);

    return res.status(200).json({
      success: true,
      message: 'Snapshot restored successfully as a new version.',
      restoredContent: targetVersion.content_snapshot,
      newVersionId,
      newLabel,
    });
  } catch (err) {
    next(err);
  }
}
