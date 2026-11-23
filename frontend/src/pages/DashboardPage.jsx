import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Layers,
  Star,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspaces } from '../context/WorkspaceContext';
import WelcomeHero from '../components/dashboard/WelcomeHero';
import WorkspaceCard from '../components/dashboard/WorkspaceCard';
import RecentDocsSection from '../components/dashboard/RecentDocsSection';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import {
  INITIAL_WORKSPACES,
  INITIAL_DOCUMENTS,
  INITIAL_ACTIVITY,
} from '../utils/mockData';

/**
 * Module 1: Workspace Dashboard
 * Demonstrates:
 * - useState for search query, active filter tabs, workspaces state
 * - Component composition (WelcomeHero, WorkspaceCard, RecentDocs, ActivityFeed)
 * - List rendering with unique keys
 * - Array filtering and searching
 */
export function DashboardPage() {
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};
  const openCreateWorkspace = outletContext.openCreateWorkspace;
  const navigate = useNavigate();

  const { workspaces, toggleFavorite } = useWorkspaces();
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activities] = useState(INITIAL_ACTIVITY);

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites' | 'engineering' | 'product'

  // Filter workspaces based on search query and category tab
  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'favorites') return Boolean(ws.isFavorite);
    if (activeTab === 'engineering') return ws.tag === 'Engineering';
    if (activeTab === 'product') return ws.tag === 'Product';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Hero Section */}
      <WelcomeHero
        user={user}
        onNewWorkspace={openCreateWorkspace}
        stats={{
          workspacesCount: workspaces.length,
          documentsCount: 36,
          collaboratorsCount: 12,
          revisionsCount: 84,
        }}
      />

      {/* 2. Workspace Management Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-forest-600 dark:text-forest-400" />
              Workspaces Directory
            </h2>
            <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
              Centralized spaces for your team documents, discussions, and permissions
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2.5">
            <div className="w-56">
              <Input
                placeholder="Filter workspaces..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                icon={Search}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openCreateWorkspace}
            >
              New Space
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Workspaces' },
            { id: 'favorites', label: 'Starred Favorites' },
            { id: 'engineering', label: 'Engineering' },
            { id: 'product', label: 'Product & Design' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors select-none ${
                activeTab === tab.id
                  ? 'bg-forest-700 text-white dark:bg-forest-600'
                  : 'bg-surface-light dark:bg-surface-dark text-content-light-secondary hover:text-content-light-primary border border-forest-100 dark:border-forest-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspaces Grid */}
        {filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredWorkspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-dashed border-forest-200 dark:border-forest-800">
            <FolderKanban className="w-10 h-10 text-content-light-muted mx-auto mb-2" />
            <p className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary">
              No matching workspaces found
            </p>
            <p className="text-xs text-content-light-secondary mt-1">
              Try adjusting your search criteria or create a new workspace.
            </p>
          </div>
        )}
      </section>

      {/* 3. Bottom Split: Recent Documents & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDocsSection
            documents={documents}
            onToggleFavoriteDoc={(id) => {}}
          />
        </div>
        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
