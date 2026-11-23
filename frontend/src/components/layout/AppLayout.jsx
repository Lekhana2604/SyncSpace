import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { FolderPlus } from 'lucide-react';
import { useWorkspaces } from '../../context/WorkspaceContext';

/**
 * Main application shell layout.
 * Wraps all protected routes with Sidebar and TopNavbar.
 * Demonstrates:
 * - Nested routes with React Router Outlet
 * - Context API (consuming useWorkspaces)
 * - Controlled form submission
 */
export function AppLayout() {
  const { addWorkspace } = useWorkspaces();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating a new workspace
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [newWorkspaceTag, setNewWorkspaceTag] = useState('Engineering');
  const [formError, setFormError] = useState('');

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      setFormError('Workspace name is required');
      return;
    }

    addWorkspace({
      name: newWorkspaceName.trim(),
      description: newWorkspaceDesc.trim() || 'Collaborative workspace.',
      tag: newWorkspaceTag,
    });

    // Reset and close
    setNewWorkspaceName('');
    setNewWorkspaceDesc('');
    setFormError('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-light-bg dark:bg-surface-dark-bg text-content-light-primary dark:text-content-dark-primary flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <TopNavbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCreateWorkspace={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openCreateWorkspace: () => setIsCreateModalOpen(true) }} />
        </main>
      </div>

      {/* Global Create Workspace Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormError('');
        }}
        title="Create New Workspace"
        description="Organize your team, documents, and real-time collaboration."
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Design Systems & Guidelines"
            value={newWorkspaceName}
            onChange={(e) => {
              setNewWorkspaceName(e.target.value);
              if (formError) setFormError('');
            }}
            error={formError}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-content-light-primary dark:text-content-dark-primary">
              Description
            </label>
            <textarea
              rows={3}
              value={newWorkspaceDesc}
              onChange={(e) => setNewWorkspaceDesc(e.target.value)}
              placeholder="Brief summary of this workspace's mission and team scope..."
              className="w-full text-sm rounded-lg border border-forest-200 dark:border-forest-800/80 bg-white dark:bg-surface-dark p-3 text-content-light-primary dark:text-content-dark-primary placeholder:text-content-light-muted focus:border-forest-600 focus:ring-2 focus:ring-forest-100 dark:focus:ring-forest-900/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-content-light-primary dark:text-content-dark-primary">
              Workspace Category
            </label>
            <select
              value={newWorkspaceTag}
              onChange={(e) => setNewWorkspaceTag(e.target.value)}
              className="w-full text-sm rounded-lg border border-forest-200 dark:border-forest-800/80 bg-white dark:bg-surface-dark p-2.5 text-content-light-primary dark:text-content-dark-primary focus:border-forest-600 focus:ring-2 focus:ring-forest-100 outline-none"
            >
              <option value="Engineering">Engineering & Architecture</option>
              <option value="Product">Product & Design</option>
              <option value="Marketing">Growth & Marketing</option>
              <option value="Operations">Operations & DevOps</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-50 dark:border-forest-900/40">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={FolderPlus}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AppLayout;
