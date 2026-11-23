import { Router } from 'express';
import {
  getDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All document routes require JWT authentication
router.use(authenticateToken);

router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
