import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  FolderKanban,
  FileText,
  Users,
  Plus,
  ArrowLeft,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useWorkspaces } from '../context/WorkspaceContext';
import apiClient from '../api/apiClient';
import { INITIAL_DOCUMENTS } from '../utils/mockData';

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspaces } = useWorkspaces();

  const workspace = workspaces.find((w) => w.id === workspaceId) || {
    id: workspaceId,
    name: 'Workspace Overview',
    description: 'System specifications, blueprints, and collaborative documentation.',
    role: 'Owner',
    membersCount: 1,
  };

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents for this workspace
  useEffect(() => {
    async function fetchDocs() {
      setLoading(true);
      try {
        const data = await apiClient.get(`/workspaces/${workspaceId}/documents`);
        if (data?.documents) {
          setDocuments(data.documents);
        } else {
          setDocuments(INITIAL_DOCUMENTS.filter((d) => d.workspaceId === workspaceId));
        }
      } catch (err) {
        console.warn('[WorkspaceDetail] Error fetching workspace documents. Using local cache.', err.message);
        setDocuments(INITIAL_DOCUMENTS.filter((d) => d.workspaceId === workspaceId));
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, [workspaceId]);

  const handleCreateDocument = async () => {
    const title = 'Untitled Document';
    try {
      const data = await apiClient.post(`/workspaces/${workspaceId}/documents`, {
        title,
        content: `<h1>${title}</h1><p>Start writing collaborative documentation...</p>`,
      });
      if (data?.document) {
        setDocuments([data.document, ...documents]);
        navigate(`/workspaces/${workspaceId}/documents/${data.document.id}`);
        return;
      }
    } catch (err) {
      console.warn('[WorkspaceDetail] Backend doc create error, fallback locally.', err.message);
    }

    // Local fallback
    const newDocId = `doc_${Date.now()}`;
    const newDoc = {
      id: newDocId,
      workspaceId: workspace.id,
      title,
      excerpt: 'Start writing collaborative documentation...',
      updatedAt: 'Just now',
      createdBy: 'You',
      collaboratorsCount: 1,
    };
    setDocuments([newDoc, ...documents]);
    navigate(`/workspaces/${workspace.id}/documents/${newDocId}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-content-light-secondary dark:text-content-dark-secondary">
        <button
          onClick={() => navigate('/workspaces')}
          className="hover:text-forest-700 dark:hover:text-forest-400 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Workspaces
        </button>
        <span>/</span>
        <span className="font-semibold text-content-light-primary dark:text-content-dark-primary">
          {workspace.name}
        </span>
      </div>

      {/* Workspace Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-forest-100 dark:border-forest-900/60 shadow-forest-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-content-light-primary dark:text-content-dark-primary">
                  {workspace.name}
                </h1>
                <Badge variant={workspace.role === 'Owner' ? 'owner' : workspace.role === 'Editor' ? 'editor' : 'viewer'}>
                  {workspace.role || 'Member'}
                </Badge>
              </div>
              <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-0.5">
                {workspace.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink to={`/team/${workspace.id}`}>
            <Button variant="outline" size="sm" icon={Users}>
              Manage Team ({workspace.membersCount || 1})
            </Button>
          </NavLink>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleCreateDocument}
          >
            New Document
          </Button>
        </div>
      </div>

      {/* Documents Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-forest-600 dark:text-forest-400" />
            Workspace Documents ({documents.length})
          </h2>
          <span className="text-xs text-content-light-secondary">
            Synchronized with MySQL & Tiptap Rich-Text Editor
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-forest-100 dark:border-forest-900/60 animate-pulse space-y-3">
                <div className="h-4 w-1/2 bg-forest-100 dark:bg-forest-800 rounded" />
                <div className="h-3 w-5/6 bg-forest-50 dark:bg-forest-900/40 rounded" />
                <div className="h-3 w-1/3 bg-forest-50 dark:bg-forest-900/40 rounded" />
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/workspaces/${workspace.id}/documents/${doc.id}`)}
                className="p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-forest-100 dark:border-forest-900/60 hover:border-forest-400 dark:hover:border-forest-600 shadow-forest-sm hover:shadow-forest-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary group-hover:text-forest-700 dark:group-hover:text-forest-300 transition-colors truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1 line-clamp-2">
                      {doc.excerpt}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-forest-50 dark:border-forest-900/30 flex items-center justify-between text-[11px] text-content-light-secondary dark:text-content-dark-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {doc.updatedAt} by {doc.createdBy || 'Alex Rivera'}
                  </span>
                  <span className="text-forest-600 dark:text-forest-400 font-medium group-hover:underline flex items-center gap-1">
                    Open Editor <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-light dark:bg-surface-dark rounded-2xl border border-dashed border-forest-200 dark:border-forest-800 space-y-3">
            <FileText className="w-10 h-10 text-content-light-muted mx-auto" />
            <p className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary">
              No documents created yet
            </p>
            <p className="text-xs text-content-light-secondary max-w-sm mx-auto">
              Start by creating your first collaborative rich-text document in this workspace.
            </p>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateDocument}>
              Create First Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceDetailPage;
