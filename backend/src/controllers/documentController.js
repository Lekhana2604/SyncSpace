import {
  listDocumentsInWorkspace,
  getDocumentById,
  createDocument,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService,
} from '../services/documentService.js';

export async function getWorkspaceDocuments(req, res, next) {
  try {
    const documents = await listDocumentsInWorkspace(req.params.workspaceId, req.user.id);
    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
}

export async function createWorkspaceDocument(req, res, next) {
  try {
    const { title, content } = req.body;
    const document = await createDocument({
      workspaceId: req.params.workspaceId,
      title,
      content,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Document created successfully.',
      document,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDocument(req, res, next) {
  try {
    const document = await getDocumentById(req.params.id, req.user.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(req, res, next) {
  try {
    const { title, content } = req.body;
    const document = await updateDocumentService(req.params.id, req.user.id, {
      title,
      content,
    });

    res.status(200).json({
      success: true,
      message: 'Document saved successfully.',
      document,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    await deleteDocumentService(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
