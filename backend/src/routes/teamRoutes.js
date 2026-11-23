import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  getWorkspaceInvitations,
  createInvitation,
  cancelInvitation,
  getInvitationByToken,
  acceptInvitation,
} from '../controllers/teamController.js';

const router = Router();

// Workspace Members
router.get('/workspaces/:workspaceId/members', authenticateToken, getWorkspaceMembers);
router.put('/workspaces/:workspaceId/members/:targetUserId', authenticateToken, updateMemberRole);
router.delete('/workspaces/:workspaceId/members/:targetUserId', authenticateToken, removeMember);

// Workspace Invitations
router.get('/workspaces/:workspaceId/invitations', authenticateToken, getWorkspaceInvitations);
router.post('/workspaces/:workspaceId/invitations', authenticateToken, createInvitation);
router.delete('/invitations/:invitationId', authenticateToken, cancelInvitation);

// Public token verification & Accept
router.get('/invitations/:token', getInvitationByToken);
router.post('/invitations/:token/accept', authenticateToken, acceptInvitation);

export default router;
