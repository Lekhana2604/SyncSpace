import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  History,
  FolderTree,
  Plus,
  Trash2,
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CollaborativeEditor from '../components/editor/CollaborativeEditor';
import DocumentCommentsDrawer from '../components/comments/DocumentCommentsDrawer';
import DocumentVersionsDrawer from '../components/versions/DocumentVersionsDrawer';
import apiClient from '../api/apiClient';
import { useWorkspace } from '../context/WorkspaceContext';
import { INITIAL_DOCUMENTS } from '../utils/mockData';

const DEFAULT_DOC_HTML = `
  <h1>SyncSpace Architecture & WebSocket Synchronization Spec</h1>
  <p>This document details the real-time collaboration pipeline integrating <strong>Yjs CRDTs</strong>, <strong>Hocuspocus WebSocket gateway</strong>, and persistent <u>MySQL relational storage</u>.</p>
  <h2>1. Architectural Highlights</h2>
  <ul>
    <li><strong>Client State</strong>: Tiptap Editor bound to Y.Doc instance.</li>
    <li><strong>Network Protocol</strong>: Binary WebSockets exchanging Yjs delta updates.</li>
    <li><strong>Storage Mechanism</strong>: Snapshots serialized into MySQL version history tables.</li>
  </ul>
  <blockquote>Simultaneous editing by multiple team members reflects immediately with live carets and presence badges.</blockquote>
  <p>Select any text to apply <strong>Bold</strong>, <em>Italic</em>, or <u>Underline</u>, or press <kbd>Ctrl+B</kbd>, <kbd>Ctrl+I</kbd>, and <kbd>Ctrl+U</kbd>.</p>
`;

/**
 * Module 2: Collaborative Document Editor (Phase 3 & Phase 4)
 * Coordinates:
 * - Routing between documents in workspace
 * - Workspace documents drawer & switching
 * - Right-hand side panels (comments & version history)
 * - Delete document modal
 * - Embedded CollaborativeEditor (Tiptap + Yjs CRDT + Hocuspocus WebSockets)
 */
export function DocumentEditorPage() {
  const { workspaceId, documentId } = useParams();
  const navigate = useNavigate();
  const workspaceContext = useWorkspace();
  const workspaces = workspaceContext?.workspaces || [];
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);
  const isReadOnly = currentWorkspace?.role === 'Viewer';

  // Document states
  const [docData, setDocData] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Workspace documents navigation drawer
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [workspaceDocs, setWorkspaceDocs] = useState([]);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Right-hand side drawers: 'comments' | 'history' | null
  const [activeSidePanel, setActiveSidePanel] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch document data and workspace documents list
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    async function loadDocumentAndList() {
      try {
        // A. Load Document Content
        const res = await apiClient.get(`/documents/${documentId}`);
        if (!isMounted) return;

        if (res?.document) {
          setDocData(res.document);
          setTitle(res.document.title);
        }
      } catch (err) {
        console.warn('[Editor] Failed to fetch document from backend, checking local fallback.', err.message);
        // Fallback to local cache / initial mock data
        const localDoc = INITIAL_DOCUMENTS.find((d) => d.id === documentId) || {
          id: documentId,
          workspaceId: workspaceId || 'ws_eng_01',
          title: 'SyncSpace Architecture & WebSocket Synchronization Spec',
          content: localStorage.getItem(`syncspace_doc_content_${documentId}`) || DEFAULT_DOC_HTML,
        };

        if (isMounted) {
          setDocData(localDoc);
          setTitle(localStorage.getItem(`syncspace_doc_title_${documentId}`) || localDoc.title);
        }
      } finally {
        if (isMounted) setLoading(false);
      }

      // B. Load Workspace Document Directory
      if (workspaceId) {
        try {
          const listRes = await apiClient.get(`/workspaces/${workspaceId}/documents`);
          if (isMounted && listRes?.documents) {
            setWorkspaceDocs(listRes.documents);
          }
        } catch {
          if (isMounted) {
            setWorkspaceDocs(INITIAL_DOCUMENTS.filter((d) => d.workspaceId === workspaceId));
          }
        }
      }
    }

    loadDocumentAndList();

    return () => {
      isMounted = false;
    };
  }, [documentId, workspaceId]);

  // Create a new document in the current workspace
  const handleCreateNewDocInWorkspace = async () => {
    try {
      const res = await apiClient.post(`/workspaces/${workspaceId}/documents`, {
        title: 'Untitled Document',
        content: '<h1>Untitled Document</h1><p>Start writing collaborative documentation...</p>',
      });
      if (res?.document) {
        setWorkspaceDocs((prev) => [res.document, ...prev]);
        setIsDocDrawerOpen(false);
        navigate(`/workspaces/${workspaceId}/documents/${res.document.id}`);
        return;
      }
    } catch {
      // Local fallback
    }

    const fallbackId = `doc_${Date.now()}`;
    const fallbackDoc = {
      id: fallbackId,
      workspaceId,
      title: 'Untitled Document',
      excerpt: 'Start writing collaborative documentation...',
      updatedAt: 'Just now',
      createdBy: 'You',
    };
    setWorkspaceDocs((prev) => [fallbackDoc, ...prev]);
    setIsDocDrawerOpen(false);
    navigate(`/workspaces/${workspaceId}/documents/${fallbackId}`);
  };

  // Delete current document
  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/documents/${documentId}`);
    } catch (err) {
      console.warn('[DeleteDoc] Backend delete error, deleting locally.', err.message);
    }
    setIsDeleteModalOpen(false);
    navigate(`/workspaces/${workspaceId}`);
  };

  // Filtered documents in drawer
  const filteredWorkspaceDocs = workspaceDocs.filter((d) =>
    d.title.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  if (loadError) {
    return (
      <div className="p-12 max-w-md mx-auto text-center bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900 shadow-forest-md space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-content-light-primary dark:text-content-dark-primary">
          Document Unavailable
        </h2>
        <p className="text-xs text-content-light-secondary">
          {loadError}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate(`/workspaces/${workspaceId}`)}>
          Return to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-300 relative">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-forest-100 dark:border-forest-900/60">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/workspaces/${workspaceId || 'ws_eng_01'}`)}
            className="p-1.5 rounded-lg text-content-light-secondary hover:text-forest-700 hover:bg-forest-50 dark:hover:bg-forest-900/40 transition-colors cursor-pointer"
            title="Back to workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Toggle Workspace Documents Drawer */}
          <button
            onClick={() => setIsDocDrawerOpen(!isDocDrawerOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isDocDrawerOpen
                ? 'bg-forest-700 text-white border-forest-700'
                : 'bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary border-forest-200 dark:border-forest-800 hover:bg-forest-50 dark:hover:bg-forest-900/40'
            }`}
            title="Browse all documents in this workspace"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Workspace Docs ({workspaceDocs.length})</span>
          </button>
        </div>

        {/* Side Panel Toggles & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'comments' ? null : 'comments')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSidePanel === 'comments'
                ? 'bg-forest-700 text-white'
                : 'bg-surface-light dark:bg-surface-dark text-content-light-secondary hover:bg-forest-50 dark:hover:bg-forest-900/40 border border-forest-100 dark:border-forest-800'
            }`}
            title="Discussion comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Comments</span>
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'history' ? null : 'history')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSidePanel === 'history'
                ? 'bg-forest-700 text-white'
                : 'bg-surface-light dark:bg-surface-dark text-content-light-secondary hover:bg-forest-50 dark:hover:bg-forest-900/40 border border-forest-100 dark:border-forest-800'
            }`}
            title="Document version snapshots"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Versions</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-lg text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
              title="Delete this document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Documents Drawer + Central Editor Canvas + Right Discussion Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Workspace Documents Navigation Drawer */}
        {isDocDrawerOpen && (
          <div className="lg:col-span-3 bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 p-4 shadow-forest-md h-fit space-y-3 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-forest-50 dark:border-forest-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 dark:text-forest-400 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                Workspace Docs
              </span>
              <button
                onClick={() => setIsDocDrawerOpen(false)}
                className="p-1 rounded text-content-light-secondary hover:text-content-light-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-content-light-secondary" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Filter documents..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-forest-200 dark:border-forest-800 bg-surface-light-subtle dark:bg-forest-950/40 outline-none focus:border-forest-600"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              className="w-full text-xs"
              onClick={handleCreateNewDocInWorkspace}
            >
              New Document
            </Button>

            {/* Documents List */}
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {filteredWorkspaceDocs.map((doc) => {
                const isActive = doc.id === documentId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      if (!isActive) {
                        navigate(`/workspaces/${workspaceId}/documents/${doc.id}`);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors block cursor-pointer ${
                      isActive
                        ? 'bg-forest-100 dark:bg-forest-900/70 text-forest-900 dark:text-forest-100 font-semibold border-l-4 border-forest-600'
                        : 'text-content-light-secondary dark:text-content-dark-secondary hover:bg-forest-50 dark:hover:bg-forest-900/30'
                    }`}
                  >
                    <p className="truncate font-medium">{doc.title}</p>
                    <p className="text-[10px] text-content-light-muted mt-0.5 truncate">
                      {doc.excerpt || 'No preview'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Central Editor Canvas */}
        <div
          className={`${
            isDocDrawerOpen && activeSidePanel
              ? 'lg:col-span-6'
              : isDocDrawerOpen || activeSidePanel
              ? 'lg:col-span-9'
              : 'lg:col-span-12'
          }`}
        >
          <CollaborativeEditor
            key={documentId}
            documentId={documentId}
            workspaceId={workspaceId}
            initialDocData={docData}
            readOnly={isReadOnly}
            onTitleUpdate={(newTitle) => setTitle(newTitle)}
          />
        </div>

        {/* Right Side Drawer (Comments or Version Snapshots) */}
        {activeSidePanel && (
          <div className="lg:col-span-3">
            {activeSidePanel === 'comments' ? (
              <DocumentCommentsDrawer
                documentId={documentId}
                onClose={() => setActiveSidePanel(null)}
              />
            ) : (
              <DocumentVersionsDrawer
                documentId={documentId}
                onClose={() => setActiveSidePanel(null)}
                onVersionRestored={(restoredContent) => {
                  setDocData((prev) => ({ ...prev, content: restoredContent }));
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document? This action cannot be undone."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-content-light-secondary">
            Document title: <strong>{title}</strong>
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-50 dark:border-forest-900/40">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleConfirmDelete}>
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DocumentEditorPage;
