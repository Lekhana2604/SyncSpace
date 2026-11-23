import { isFallback, getPool, getInMemoryStore } from '../database/db.js';

/**
 * Controller for User Notifications & Unread Alerts
 */

// 1. Get all notifications for current user
export async function getUserNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      const [notifications] = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;

      return res.status(200).json({
        success: true,
        notifications: notifications.map((n) => ({ ...n, is_read: Boolean(n.is_read) })),
        unreadCount,
      });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const notifications = store.notifications
      .filter((n) => n.user_id === userId)
      .map((n) => ({ ...n, is_read: Boolean(n.is_read) }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

// 2. Mark a notification as read
export async function markNotificationRead(req, res, next) {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );
      return res.status(200).json({ success: true, message: 'Notification marked as read.' });
    }

    const store = getInMemoryStore();
    const n = store.notifications.find((notif) => notif.id === notificationId && notif.user_id === userId);
    if (n) {
      n.is_read = 1;
    }
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

// 3. Mark all notifications as read
export async function markAllNotificationsRead(req, res, next) {
  try {
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const store = getInMemoryStore();
    for (const n of store.notifications) {
      if (n.user_id === userId) {
        n.is_read = 1;
      }
    }
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

// 4. Dismiss/Delete notification
export async function deleteNotification(req, res, next) {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notificationId, userId]);
      return res.status(200).json({ success: true, message: 'Notification dismissed.' });
    }

    const store = getInMemoryStore();
    const index = store.notifications.findIndex((n) => n.id === notificationId && n.user_id === userId);
    if (index !== -1) {
      store.notifications.splice(index, 1);
    }
    return res.status(200).json({ success: true, message: 'Notification dismissed.' });
  } catch (err) {
    next(err);
  }
}
