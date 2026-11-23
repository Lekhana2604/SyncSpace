import { isFallback, getPool, getInMemoryStore } from '../database/db.js';

/**
 * Controller for Workspace Activity Stream & Audit Logs
 */
export async function getWorkspaceActivity(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      // Check membership
      const [caller] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, userId]
      );
      if (!caller || caller.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const [activities] = await pool.query(
        `SELECT a.id, a.workspace_id, a.user_id, a.action_type, a.description, a.created_at,
                u.name AS user_name, u.avatar_url AS user_avatar
         FROM activity_logs a
         JOIN users u ON a.user_id = u.id
         WHERE a.workspace_id = ?
         ORDER BY a.created_at DESC
         LIMIT 50`,
        [workspaceId]
      );

      return res.status(200).json({ success: true, activities });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const caller = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );
    if (!caller) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const activities = store.activityLogs
      .filter((a) => a.workspace_id === workspaceId)
      .map((a) => {
        const u = store.users.find((user) => user.id === a.user_id) || {};
        return {
          ...a,
          user_name: u.name || 'Team Member',
          user_avatar: u.avatar_url || null,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);

    return res.status(200).json({ success: true, activities });
  } catch (err) {
    next(err);
  }
}
