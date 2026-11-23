import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDocumentVersions,
  getVersionById,
  createVersionSnapshot,
  restoreVersionSnapshot,
} from '../controllers/versionController.js';

const router = Router();

// Version snapshots
router.get('/documents/:documentId/versions', authenticateToken, getDocumentVersions);
router.get('/versions/:versionId', authenticateToken, getVersionById);
router.post('/documents/:documentId/versions', authenticateToken, createVersionSnapshot);
router.post('/versions/:versionId/restore', authenticateToken, restoreVersionSnapshot);

export default router;
