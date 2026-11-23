import React, { useState, useEffect } from 'react';
import {
  History,
  Settings,
  Palette,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  Save,
  Moon,
  Sun,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import apiClient from '../api/apiClient';

/**
 * Module 5: Document Version History, Workspace Settings & Appearance (Phase 6)
 */
export function VersionHistorySettingsPage() {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'history' | 'appearance'
  const [selectedVersionToRestore, setSelectedVersionToRestore] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Workspace settings state
  const [workspaceName, setWorkspaceName] = useState('Core Engineering & Architecture');
  const [workspaceDesc, setWorkspaceDesc] = useState(
    'System specifications, microservices blueprints, and technical RFCs.'
  );
  const [workspaceTag, setWorkspaceTag] = useState('Engineering');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Danger zone modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Versions state
  const [revisions, setRevisions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  // 1. Fetch versions for default document
  const loadVersions = async () => {
    try {
      setVersionsLoading(true);
      const res = await apiClient.get('/documents/doc_101/versions');
      if (res?.versions) {
        setRevisions(res.versions);
      }
    } catch {
      // Fallback
      setRevisions([
        {
          id: 'ver_101',
          version_label: 'v1.0 - Initial Draft',
          created_at: new Date(Date.now() - 86400000),
          author_name: 'Alex Rivera',
          change_summary: 'Initial project setup and syllabus mapping.',
        },
        {
          id: 'ver_102',
          version_label: 'v1.1 - Added WebSocket Specs',
          created_at: new Date(Date.now() - 28800000),
          author_name: 'Sarah Chen',
          change_summary: 'Added Hocuspocus WebSocket integration and Yjs update vector details.',
        },
      ]);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  // 2. Save workspace settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      await apiClient.put('/workspaces/ws_eng_01', {
        name: workspaceName,
        description: workspaceDesc,
        tag: workspaceTag,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update workspace settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  // 3. Confirm restore (non-destructive: creates new version)
  const handleConfirmRestore = async () => {
    if (!selectedVersionToRestore) return;

    try {
      setRestoreLoading(true);
      const res = await apiClient.post(`/versions/${selectedVersionToRestore.id}/restore`);
      if (res?.success) {
        await loadVersions();
        setShowRestoreModal(false);
        setSelectedVersionToRestore(null);
        alert('Historical snapshot restored successfully as a new version!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore snapshot.');
    } finally {
      setRestoreLoading(false);
    }
  };

  // 4. Delete workspace
  const handleConfirmDeleteWorkspace = async () => {
    try {
      setDeleteLoading(true);
      await apiClient.delete('/workspaces/ws_eng_01');
      setShowDeleteModal(false);
      window.location.href = '/workspaces';
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workspace.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-forest-700 dark:text-forest-400" />
          Settings & Version History
        </h1>
        <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1">
          Configure workspace metadata, manage document revisions, and personalize Forest theme appearance.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-forest-100 dark:border-forest-900/60 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-forest-100 dark:bg-forest-900/60 text-forest-900 dark:text-forest-100 border border-forest-300 dark:border-forest-700'
              : 'text-content-light-secondary hover:text-content-light-primary hover:bg-forest-50 dark:hover:bg-forest-900/20'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Workspace Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-forest-100 dark:bg-forest-900/60 text-forest-900 dark:text-forest-100 border border-forest-300 dark:border-forest-700'
              : 'text-content-light-secondary hover:text-content-light-primary hover:bg-forest-50 dark:hover:bg-forest-900/20'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Revision History ({revisions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'appearance'
              ? 'bg-forest-100 dark:bg-forest-900/60 text-forest-900 dark:text-forest-100 border border-forest-300 dark:border-forest-700'
              : 'text-content-light-secondary hover:text-content-light-primary hover:bg-forest-50 dark:hover:bg-forest-900/20'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Forest Theme Tokens</span>
        </button>
      </div>

      {/* Tab 1: Workspace Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 p-6 shadow-forest-sm space-y-4"
          >
            <h2 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-600" />
              General Information
            </h2>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Workspace settings saved successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-content-light-primary dark:text-content-dark-primary mb-1">
                Workspace Name
              </label>
              <Input
                type="text"
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-light-primary dark:text-content-dark-primary mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={workspaceDesc}
                onChange={(e) => setWorkspaceDesc(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark outline-none focus:border-forest-600 text-content-light-primary dark:text-content-dark-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-light-primary dark:text-content-dark-primary mb-1">
                Category Tag
              </label>
              <select
                value={workspaceTag}
                onChange={(e) => setWorkspaceTag(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark outline-none focus:border-forest-600 text-content-light-primary dark:text-content-dark-primary cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" icon={Save} loading={saveLoading}>
                Save Changes
              </Button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-red-50/40 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Danger Zone
            </h3>
            <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
              Permanently delete this workspace and all associated documents, comments, and member access. This action cannot be undone.
            </p>
            <div>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Revision History */}
      {activeTab === 'history' && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 p-6 shadow-forest-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-forest-50 dark:border-forest-900/40">
            <h2 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
              <History className="w-4 h-4 text-forest-600" />
              Historical Document Snapshots
            </h2>
            <Badge variant="forest">{revisions.length} Total Snapshots</Badge>
          </div>

          <div className="space-y-3">
            {revisions.map((rev, idx) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-forest-100 dark:border-forest-800 bg-surface-light-subtle dark:bg-forest-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-content-light-primary dark:text-content-dark-primary">
                      {rev.version_label}
                    </span>
                    {idx === 0 && <Badge variant="emerald">Current</Badge>}
                  </div>
                  <p className="text-[11px] text-content-light-secondary mt-0.5">
                    Created on {rev.created_at ? new Date(rev.created_at).toLocaleString() : ''} by{' '}
                    <strong>{rev.author_name}</strong>
                  </p>
                  {rev.change_summary && (
                    <p className="text-[11px] text-content-light-muted italic mt-1">
                      "{rev.change_summary}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => {
                      setSelectedVersionToRestore(rev);
                      setShowRestoreModal(true);
                    }}
                  >
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Appearance & Theme Tokens */}
      {activeTab === 'appearance' && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 p-6 shadow-forest-sm space-y-6">
          <h2 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
            <Palette className="w-4 h-4 text-forest-600" />
            Forest Design Tokens & Theme Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                !isDark
                  ? 'border-forest-600 bg-forest-50/60 dark:bg-forest-900/30'
                  : 'border-forest-100 dark:border-forest-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sun className="w-5 h-5 text-amber-500" />
                {!isDark && <Badge variant="emerald">Active</Badge>}
              </div>
              <h3 className="font-bold text-sm text-content-light-primary dark:text-content-dark-primary">
                Forest Light Mode
              </h3>
              <p className="text-xs text-content-light-secondary mt-1">
                Soft Mint surfaces, Sage Green accents, and high-contrast deep forest green typography.
              </p>
            </div>

            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isDark
                  ? 'border-forest-600 bg-forest-900/40'
                  : 'border-forest-100 dark:border-forest-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Moon className="w-5 h-5 text-forest-300" />
                {isDark && <Badge variant="emerald">Active</Badge>}
              </div>
              <h3 className="font-bold text-sm text-content-light-primary dark:text-content-dark-primary">
                Deep Forest Dark Mode
              </h3>
              <p className="text-xs text-content-light-secondary mt-1">
                Carefully tuned night surfaces (#101C18 & #192A23) with soothing mint highlights.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Restore Snapshot Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restore Version"
        description="Restoring will create a brand new revision snapshot with this historical content, preserving full audit history."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-content-light-secondary">
            Target Revision: <strong>{selectedVersionToRestore?.version_label}</strong>
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-50 dark:border-forest-900/40">
            <Button variant="outline" size="sm" onClick={() => setShowRestoreModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              loading={restoreLoading}
              onClick={handleConfirmRestore}
            >
              Confirm Restore
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Workspace Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Workspace"
        description="Are you absolutely sure you want to permanently delete this workspace? All documents and comments will be erased."
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-50 dark:border-forest-900/40">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              loading={deleteLoading}
              onClick={handleConfirmDeleteWorkspace}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default VersionHistorySettingsPage;
