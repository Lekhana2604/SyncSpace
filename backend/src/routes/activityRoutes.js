import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getWorkspaceActivity } from '../controllers/activityController.js';

const router = Router();

// Workspace Activity Audit Logs
router.get('/workspaces/:workspaceId/activity', authenticateToken, getWorkspaceActivity);

export default router;
