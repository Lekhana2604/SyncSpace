import {
  listWorkspacesForUser,
  getWorkspaceById as getWorkspaceByIdService,
  createWorkspace as createWorkspaceService,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService,
  toggleFavoriteWorkspace as toggleFavoriteService,
} from '../services/workspaceService.js';

export async function getWorkspaces(req, res, next) {
  try {
    const { search, favorite } = req.query;
    let workspaces = await listWorkspacesForUser(req.user.id);

    if (search) {
      const q = search.toLowerCase();
      workspaces = workspaces.filter(
        (ws) =>
          ws.name?.toLowerCase().includes(q) ||
          ws.description?.toLowerCase().includes(q)
      );
    }

    if (favorite === 'true') {
      workspaces = workspaces.filter((ws) => ws.isFavorite === true);
    }

    res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkspaceById(req, res, next) {
  try {
    const workspace = await getWorkspaceByIdService(req.params.id, req.user.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found or you do not have permission to access it.',
      });
    }

    res.status(200).json({
      success: true,
      workspace,
    });
  } catch (err) {
    next(err);
  }
}

export async function createWorkspace(req, res, next) {
  try {
    const { name, description, tag, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required.',
      });
    }

    const created = await createWorkspaceService({
      name: name.trim(),
      description: description ? description.trim() : '',
      tag: tag || 'Engineering',
      icon: icon || 'FolderKanban',
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully.',
      workspace: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateWorkspace(req, res, next) {
  try {
    const { name, description, tag } = req.body;
    const updated = await updateWorkspaceService(req.params.id, req.user.id, {
      name,
      description,
      tag,
    });

    res.status(200).json({
      success: true,
      message: 'Workspace updated successfully.',
      workspace: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteWorkspace(req, res, next) {
  try {
    await deleteWorkspaceService(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(req, res, next) {
  try {
    const result = await toggleFavoriteService(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
