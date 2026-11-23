import { isFallback, getPool, getInMemoryStore } from '../database/db.js';

/**
 * Controller for In-Document Discussion Comments & Replies
 */

// 1. Get all comments and replies for a document
export async function getDocumentComments(req, res, next) {
  try {
    const { documentId } = req.params;

    if (!isFallback()) {
      const pool = getPool();

      const [comments] = await pool.query(
        `SELECT c.id, c.document_id, c.author_id, c.content, c.is_resolved, c.created_at, c.updated_at,
                u.name AS author_name, u.email AS author_email, u.avatar_url AS author_avatar
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.document_id = ?
         ORDER BY c.created_at ASC`,
        [documentId]
      );

      const [replies] = await pool.query(
        `SELECT r.id, r.comment_id, r.author_id, r.content, r.created_at,
                u.name AS author_name, u.email AS author_email, u.avatar_url AS author_avatar
         FROM comment_replies r
         JOIN users u ON r.author_id = u.id
         JOIN comments c ON r.comment_id = c.id
         WHERE c.document_id = ?
         ORDER BY r.created_at ASC`,
        [documentId]
      );

      const repliesMap = {};
      for (const r of replies) {
        if (!repliesMap[r.comment_id]) repliesMap[r.comment_id] = [];
        repliesMap[r.comment_id].push(r);
      }

      const results = comments.map((c) => ({
        ...c,
        is_resolved: Boolean(c.is_resolved),
        replies: repliesMap[c.id] || [],
      }));

      return res.status(200).json({ success: true, comments: results });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const comments = store.comments
      .filter((c) => c.document_id === documentId)
      .map((c) => {
        const author = store.users.find((u) => u.id === c.author_id) || {};
        const replies = store.commentReplies
          .filter((r) => r.comment_id === c.id)
          .map((r) => {
            const replyAuthor = store.users.find((u) => u.id === r.author_id) || {};
            return {
              ...r,
              author_name: replyAuthor.name || 'Collaborator',
              author_email: replyAuthor.email || '',
              author_avatar: replyAuthor.avatar_url || null,
            };
          });

        return {
          ...c,
          is_resolved: Boolean(c.is_resolved),
          author_name: author.name || 'Collaborator',
          author_email: author.email || '',
          author_avatar: author.avatar_url || null,
          replies,
        };
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return res.status(200).json({ success: true, comments });
  } catch (err) {
    next(err);
  }
}

// 2. Create a comment on a document
export async function createComment(req, res, next) {
  try {
    const { documentId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const commentId = `comm_${Date.now()}`;

    if (!isFallback()) {
      const pool = getPool();
      await pool.query(
        'INSERT INTO comments (id, document_id, author_id, content, is_resolved) VALUES (?, ?, ?, ?, 0)',
        [commentId, documentId, authorId, content.trim()]
      );

      // Fetch created with author info
      const [rows] = await pool.query(
        `SELECT c.*, u.name AS author_name, u.email AS author_email, u.avatar_url AS author_avatar
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.id = ?`,
        [commentId]
      );

      const created = { ...rows[0], is_resolved: false, replies: [] };
      return res.status(201).json({ success: true, comment: created });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const author = store.users.find((u) => u.id === authorId) || { name: req.user.name };
    const newComment = {
      id: commentId,
      document_id: documentId,
      author_id: authorId,
      content: content.trim(),
      is_resolved: false,
      created_at: new Date(),
      updated_at: new Date(),
      author_name: author.name || 'Collaborator',
      author_email: author.email || '',
      author_avatar: author.avatar_url || null,
      replies: [],
    };
    store.comments.push(newComment);

    return res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    next(err);
  }
}

// 3. Create a reply to an existing comment
export async function createReply(req, res, next) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty.' });
    }

    const replyId = `rep_${Date.now()}`;

    if (!isFallback()) {
      const pool = getPool();
      await pool.query(
        'INSERT INTO comment_replies (id, comment_id, author_id, content) VALUES (?, ?, ?, ?)',
        [replyId, commentId, authorId, content.trim()]
      );

      const [rows] = await pool.query(
        `SELECT r.*, u.name AS author_name, u.email AS author_email, u.avatar_url AS author_avatar
         FROM comment_replies r
         JOIN users u ON r.author_id = u.id
         WHERE r.id = ?`,
        [replyId]
      );

      return res.status(201).json({ success: true, reply: rows[0] });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const author = store.users.find((u) => u.id === authorId) || { name: req.user.name };
    const newReply = {
      id: replyId,
      comment_id: commentId,
      author_id: authorId,
      content: content.trim(),
      created_at: new Date(),
      author_name: author.name || 'Collaborator',
      author_email: author.email || '',
      author_avatar: author.avatar_url || null,
    };
    store.commentReplies.push(newReply);

    return res.status(201).json({ success: true, reply: newReply });
  } catch (err) {
    next(err);
  }
}

// 4. Toggle resolve/unresolve comment
export async function toggleResolveComment(req, res, next) {
  try {
    const { commentId } = req.params;

    if (!isFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT is_resolved FROM comments WHERE id = ?', [commentId]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Comment not found.' });
      }

      const nextStatus = rows[0].is_resolved ? 0 : 1;
      await pool.query('UPDATE comments SET is_resolved = ? WHERE id = ?', [nextStatus, commentId]);

      return res.status(200).json({
        success: true,
        is_resolved: Boolean(nextStatus),
        message: nextStatus ? 'Comment resolved.' : 'Comment reopened.',
      });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    comment.is_resolved = !comment.is_resolved;
    return res.status(200).json({
      success: true,
      is_resolved: Boolean(comment.is_resolved),
      message: comment.is_resolved ? 'Comment resolved.' : 'Comment reopened.',
    });
  } catch (err) {
    next(err);
  }
}

// 5. Delete a comment
export async function deleteComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT author_id FROM comments WHERE id = ?', [commentId]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Comment not found.' });
      }

      if (rows[0].author_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
      }

      await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
      return res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const index = store.comments.findIndex((c) => c.id === commentId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (store.comments[index].author_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
    }

    store.comments.splice(index, 1);
    // Delete replies
    store.commentReplies = store.commentReplies.filter((r) => r.comment_id !== commentId);

    return res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
