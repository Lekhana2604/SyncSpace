import crypto from 'crypto';
import { isFallback, getPool, getInMemoryStore } from '../database/db.js';

/**
 * Controller for Team Roster, Member Management & Invitations
 */

// 1. Get all members of a workspace
export async function getWorkspaceMembers(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();

      // Check caller membership
      const [caller] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, userId]
      );
      if (!caller || caller.length === 0) {
        return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
      }

      const [members] = await pool.query(
        `SELECT wm.id, wm.workspace_id, wm.user_id, wm.role, wm.joined_at,
                u.name, u.email, u.avatar_url
         FROM workspace_members wm
         JOIN users u ON wm.user_id = u.id
         WHERE wm.workspace_id = ?
         ORDER BY (CASE wm.role WHEN 'Owner' THEN 1 WHEN 'Editor' THEN 2 ELSE 3 END), wm.joined_at ASC`,
        [workspaceId]
      );

      return res.status(200).json({ success: true, members });
    }

    // Fallback in-memory
    const store = getInMemoryStore();
    const caller = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );
    if (!caller) {
      return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
    }

    const members = store.workspaceMembers
      .filter((wm) => wm.workspace_id === workspaceId)
      .map((wm) => {
        const u = store.users.find((user) => user.id === wm.user_id) || {};
        return {
          id: wm.id,
          workspace_id: wm.workspace_id,
          user_id: wm.user_id,
          role: wm.role,
          joined_at: wm.joined_at,
          name: u.name || 'Collaborator',
          email: u.email || 'user@syncspace.dev',
          avatar_url: u.avatar_url || null,
        };
      })
      .sort((a, b) => {
        const order = { Owner: 1, Editor: 2, Viewer: 3 };
        return (order[a.role] || 4) - (order[b.role] || 4);
      });

    return res.status(200).json({ success: true, members });
  } catch (err) {
    next(err);
  }
}

// 2. Update a workspace member's role (Owner only)
export async function updateMemberRole(req, res, next) {
  try {
    const { workspaceId, targetUserId } = req.params;
    const { role } = req.body;
    const callerId = req.user.id;

    if (!['Editor', 'Viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either Editor or Viewer.' });
    }

    if (!isFallback()) {
      const pool = getPool();
      // Check caller is Owner
      const [caller] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, callerId]
      );
      if (!caller || caller[0]?.role !== 'Owner') {
        return res.status(403).json({ success: false, message: 'Only workspace owners can modify member roles.' });
      }

      // Check target member is not owner
      const [target] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, targetUserId]
      );
      if (!target || target.length === 0) {
        return res.status(404).json({ success: false, message: 'Member not found in workspace.' });
      }
      if (target[0].role === 'Owner') {
        return res.status(400).json({ success: false, message: 'Cannot change the role of the workspace owner.' });
      }

      await pool.query(
        'UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ?',
        [role, workspaceId, targetUserId]
      );

      // Log activity
      await pool.query(
        'INSERT INTO activity_logs (id, workspace_id, user_id, action_type, description) VALUES (?, ?, ?, ?, ?)',
        [`act_${Date.now()}`, workspaceId, callerId, 'role_updated', `Changed member role to ${role}`]
      );

      return res.status(200).json({ success: true, message: `Role updated to ${role} successfully.` });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const caller = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === callerId
    );
    if (!caller || caller.role !== 'Owner') {
      return res.status(403).json({ success: false, message: 'Only workspace owners can modify member roles.' });
    }

    const target = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === targetUserId
    );
    if (!target) {
      return res.status(404).json({ success: false, message: 'Member not found in workspace.' });
    }
    if (target.role === 'Owner') {
      return res.status(400).json({ success: false, message: 'Cannot change the role of the workspace owner.' });
    }

    target.role = role;
    store.activityLogs.unshift({
      id: `act_${Date.now()}`,
      workspace_id: workspaceId,
      user_id: callerId,
      action_type: 'role_updated',
      description: `Changed member role to ${role}`,
      created_at: new Date(),
    });

    return res.status(200).json({ success: true, message: `Role updated to ${role} successfully.` });
  } catch (err) {
    next(err);
  }
}

// 3. Remove a member from workspace (Owner only or self leaving)
export async function removeMember(req, res, next) {
  try {
    const { workspaceId, targetUserId } = req.params;
    const callerId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      const [caller] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, callerId]
      );

      const isOwner = caller && caller[0]?.role === 'Owner';
      const isSelf = callerId === targetUserId;

      if (!isOwner && !isSelf) {
        return res.status(403).json({ success: false, message: 'Unauthorized to remove this member.' });
      }

      const [target] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, targetUserId]
      );
      if (target && target[0]?.role === 'Owner') {
        return res.status(400).json({ success: false, message: 'Cannot remove the workspace owner.' });
      }

      await pool.query(
        'DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, targetUserId]
      );

      // Log activity
      await pool.query(
        'INSERT INTO activity_logs (id, workspace_id, user_id, action_type, description) VALUES (?, ?, ?, ?, ?)',
        [`act_${Date.now()}`, workspaceId, callerId, 'member_removed', 'Removed member from workspace']
      );

      return res.status(200).json({ success: true, message: 'Member removed successfully.' });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const caller = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === callerId
    );
    const isOwner = caller && caller.role === 'Owner';
    const isSelf = callerId === targetUserId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({ success: false, message: 'Unauthorized to remove this member.' });
    }

    const targetIndex = store.workspaceMembers.findIndex(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === targetUserId
    );
    if (targetIndex === -1) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }
    if (store.workspaceMembers[targetIndex].role === 'Owner') {
      return res.status(400).json({ success: false, message: 'Cannot remove the workspace owner.' });
    }

    store.workspaceMembers.splice(targetIndex, 1);
    store.activityLogs.unshift({
      id: `act_${Date.now()}`,
      workspace_id: workspaceId,
      user_id: callerId,
      action_type: 'member_removed',
      description: 'Removed member from workspace',
      created_at: new Date(),
    });

    return res.status(200).json({ success: true, message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
}

// 4. Get pending workspace invitations
export async function getWorkspaceInvitations(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      const [caller] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, userId]
      );
      if (!caller || caller.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const [invitations] = await pool.query(
        'SELECT * FROM invitations WHERE workspace_id = ? AND status = ? ORDER BY created_at DESC',
        [workspaceId, 'pending']
      );
      return res.status(200).json({ success: true, invitations });
    }

    const store = getInMemoryStore();
    const caller = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === userId
    );
    if (!caller) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const invitations = store.invitations.filter(
      (inv) => inv.workspace_id === workspaceId && inv.status === 'pending'
    );
    return res.status(200).json({ success: true, invitations });
  } catch (err) {
    next(err);
  }
}

// 5. Create a new team invitation
export async function createInvitation(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const { email, role = 'Editor' } = req.body;
    const callerId = req.user.id;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const token = `inv_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (!isFallback()) {
      const pool = getPool();
      // Caller must be Owner or Editor
      const [caller] = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [workspaceId, callerId]
      );
      if (!caller || !['Owner', 'Editor'].includes(caller[0]?.role)) {
        return res.status(403).json({ success: false, message: 'Only workspace owners and editors can invite members.' });
      }

      const invitationId = `inv_${Date.now()}`;
      await pool.query(
        'INSERT INTO invitations (id, workspace_id, email, role, token, status, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [invitationId, workspaceId, email.toLowerCase(), role, token, 'pending', expiresAt]
      );

      await pool.query(
        'INSERT INTO activity_logs (id, workspace_id, user_id, action_type, description) VALUES (?, ?, ?, ?, ?)',
        [`act_${Date.now()}`, workspaceId, callerId, 'member_invited', `Invited ${email} as ${role}`]
      );

      const invitation = {
        id: invitationId,
        workspace_id: workspaceId,
        email: email.toLowerCase(),
        role,
        token,
        status: 'pending',
        expires_at: expiresAt,
      };

      return res.status(201).json({
        success: true,
        invitation,
        inviteUrl: `/invite/${token}`,
      });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const caller = store.workspaceMembers.find(
      (wm) => wm.workspace_id === workspaceId && wm.user_id === callerId
    );
    if (!caller || !['Owner', 'Editor'].includes(caller.role)) {
      return res.status(403).json({ success: false, message: 'Only workspace owners and editors can invite members.' });
    }

    const invitation = {
      id: `inv_${Date.now()}`,
      workspace_id: workspaceId,
      email: email.toLowerCase(),
      role,
      token,
      status: 'pending',
      expires_at: expiresAt,
      created_at: new Date(),
    };
    store.invitations.unshift(invitation);

    store.activityLogs.unshift({
      id: `act_${Date.now()}`,
      workspace_id: workspaceId,
      user_id: callerId,
      action_type: 'member_invited',
      description: `Invited ${email} as ${role}`,
      created_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      invitation,
      inviteUrl: `/invite/${token}`,
    });
  } catch (err) {
    next(err);
  }
}

// 6. Cancel/Revoke a pending invitation
export async function cancelInvitation(req, res, next) {
  try {
    const { invitationId } = req.params;

    if (!isFallback()) {
      const pool = getPool();
      await pool.query('DELETE FROM invitations WHERE id = ?', [invitationId]);
      return res.status(200).json({ success: true, message: 'Invitation cancelled.' });
    }

    const store = getInMemoryStore();
    const index = store.invitations.findIndex((i) => i.id === invitationId);
    if (index !== -1) {
      store.invitations.splice(index, 1);
    }
    return res.status(200).json({ success: true, message: 'Invitation cancelled.' });
  } catch (err) {
    next(err);
  }
}

// 7. Get invitation details by public token
export async function getInvitationByToken(req, res, next) {
  try {
    const { token } = req.params;

    if (!isFallback()) {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT i.id, i.workspace_id, i.email, i.role, i.status, i.expires_at,
                w.name AS workspace_name, w.description AS workspace_description,
                u.name AS inviter_name
         FROM invitations i
         JOIN workspaces w ON i.workspace_id = w.id
         JOIN users u ON w.owner_id = u.id
         WHERE i.token = ?`,
        [token]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Invitation not found or has expired.' });
      }

      const inv = rows[0];
      if (inv.status !== 'pending' || new Date(inv.expires_at) < new Date()) {
        return res.status(400).json({ success: false, message: 'This invitation is no longer active.' });
      }

      return res.status(200).json({ success: true, invitation: inv });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const inv = store.invitations.find((i) => i.token === token);
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Invitation not found or has expired.' });
    }
    if (inv.status !== 'pending' || new Date(inv.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This invitation is no longer active.' });
    }

    const ws = store.workspaces.find((w) => w.id === inv.workspace_id) || {};
    const owner = store.users.find((u) => u.id === ws.owner_id) || {};

    return res.status(200).json({
      success: true,
      invitation: {
        ...inv,
        workspace_name: ws.name || 'Workspace',
        workspace_description: ws.description || '',
        inviter_name: owner.name || 'Workspace Owner',
      },
    });
  } catch (err) {
    next(err);
  }
}

// 8. Accept invitation
export async function acceptInvitation(req, res, next) {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    if (!isFallback()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT * FROM invitations WHERE token = ? AND status = ?',
        [token, 'pending']
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Invalid or expired invitation token.' });
      }

      const inv = rows[0];
      if (new Date(inv.expires_at) < new Date()) {
        return res.status(400).json({ success: false, message: 'This invitation has expired.' });
      }

      // Add to workspace_members (or update if already member)
      await pool.query(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role, is_favorite)
         VALUES (?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [`wm_${Date.now()}`, inv.workspace_id, userId, inv.role]
      );

      // Update invitation status
      await pool.query('UPDATE invitations SET status = ? WHERE id = ?', ['accepted', inv.id]);

      // Log activity
      await pool.query(
        'INSERT INTO activity_logs (id, workspace_id, user_id, action_type, description) VALUES (?, ?, ?, ?, ?)',
        [`act_${Date.now()}`, inv.workspace_id, userId, 'member_joined', `Accepted invitation and joined as ${inv.role}`]
      );

      return res.status(200).json({
        success: true,
        message: 'Invitation accepted! Welcome to the workspace.',
        workspaceId: inv.workspace_id,
      });
    }

    // In-memory fallback
    const store = getInMemoryStore();
    const inv = store.invitations.find((i) => i.token === token && i.status === 'pending');
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation token.' });
    }
    if (new Date(inv.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This invitation has expired.' });
    }

    // Add or update member
    const existing = store.workspaceMembers.find(
      (wm) => wm.workspace_id === inv.workspace_id && wm.user_id === userId
    );
    if (existing) {
      existing.role = inv.role;
    } else {
      store.workspaceMembers.push({
        id: `wm_${Date.now()}`,
        workspace_id: inv.workspace_id,
        user_id: userId,
        role: inv.role,
        is_favorite: 0,
        joined_at: new Date(),
      });
    }

    inv.status = 'accepted';
    store.activityLogs.unshift({
      id: `act_${Date.now()}`,
      workspace_id: inv.workspace_id,
      user_id: userId,
      action_type: 'member_joined',
      description: `Accepted invitation and joined as ${inv.role}`,
      created_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted! Welcome to the workspace.',
      workspaceId: inv.workspace_id,
    });
  } catch (err) {
    next(err);
  }
}
