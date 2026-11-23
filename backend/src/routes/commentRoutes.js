import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDocumentComments,
  createComment,
  createReply,
  toggleResolveComment,
  deleteComment,
} from '../controllers/commentController.js';

const router = Router();

// Document Comments
router.get('/documents/:documentId/comments', authenticateToken, getDocumentComments);
router.post('/documents/:documentId/comments', authenticateToken, createComment);

// Comment Replies & Operations
router.post('/comments/:commentId/replies', authenticateToken, createReply);
router.patch('/comments/:commentId/resolve', authenticateToken, toggleResolveComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;
