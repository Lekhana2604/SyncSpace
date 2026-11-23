import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

// Notifications
router.get('/notifications', authenticateToken, getUserNotifications);
router.patch('/notifications/:notificationId/read', authenticateToken, markNotificationRead);
router.post('/notifications/read-all', authenticateToken, markAllNotificationsRead);
router.delete('/notifications/:notificationId', authenticateToken, deleteNotification);

export default router;
