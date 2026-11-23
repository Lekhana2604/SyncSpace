import { Router } from 'express';
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  toggleFavorite,
} from '../controllers/workspaceController.js';
import {
  getWorkspaceDocuments,
  createWorkspaceDocument,
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All workspace routes require valid JWT authentication
router.use(authenticateToken);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspaceById);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);
router.patch('/:id/favorite', toggleFavorite);

// Documents inside a workspace
router.get('/:workspaceId/documents', getWorkspaceDocuments);
router.post('/:workspaceId/documents', createWorkspaceDocument);

export default router;
