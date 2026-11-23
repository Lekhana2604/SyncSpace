import React, { useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Star,
  Share2,
  FolderOpen
} from 'lucide-react';
import WorkspaceCard from '../components/dashboard/WorkspaceCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useWorkspaces } from '../context/WorkspaceContext';

/**
 * WorkspacesPage handles three view contexts based on route:
 * - /workspaces: Full directory
 * - /favorites: Starred workspaces only (strictly filtering ws.isFavorite === true)
 * - /shared: Shared workspaces only (ws.role !== 'Owner')
 */
export function WorkspacesPage() {
  const outletContext = useOutletContext() || {};
  const openCreateWorkspace = outletContext.openCreateWorkspace;
  const location = useLocation();
  const navigate = useNavigate();

  const { workspaces, toggleFavorite } = useWorkspaces();

  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'documents'

  const isFavoritesView = location.pathname === '/favorites';
  const isSharedView = location.pathname === '/shared';

  // Compute view metadata dynamically based on route
  const pageTitle = isFavoritesView
    ? 'Favorite Workspaces'
    : isSharedView
    ? 'Shared With Me'
    : 'My Workspaces';

  const pageDescription = isFavoritesView
    ? 'Quick access to all your starred workspaces'
    : isSharedView
    ? 'Workspaces shared with you by team members and collaborators'
    : 'Manage your project spaces, access team documents, and configure memberships';

  const PageIcon = isFavoritesView ? Star : isSharedView ? Share2 : FolderKanban;
  const iconColor = isFavoritesView
    ? 'text-amber-500'
    : isSharedView
    ? 'text-forest-600 dark:text-forest-400'
    : 'text-forest-700 dark:text-forest-400';

  // Filter workspaces strictly based on route AND search/category filters
  const filtered = workspaces
    .filter((ws) => {
      // 1. Route-based constraint
      if (isFavoritesView && !ws.isFavorite) {
        return false;
      }
      if (isSharedView && ws.role === 'Owner') {
        return false;
      }

      // 2. Search query constraint
      const matchSearch =
        ws.name.toLowerCase().includes(search.toLowerCase()) ||
        ws.description.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // 3. Category tag constraint
      if (filterTag !== 'all' && ws.tag !== filterTag) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'documents') return b.documentsCount - a.documentsCount;
      return 0; // default recent
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2.5">
            <PageIcon className={`w-6 h-6 ${iconColor}`} />
            {pageTitle}
          </h1>
          <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1">
            {pageDescription}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={openCreateWorkspace}
        >
          Create Workspace
        </Button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-forest-100 dark:border-forest-900/60 shadow-forest-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-72">
          <Input
            placeholder={
              isFavoritesView
                ? 'Search favorite workspaces...'
                : 'Search workspaces...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-content-light-secondary">Tag:</span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="rounded-lg border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark p-1.5 text-xs text-content-light-primary dark:text-content-dark-primary"
            >
              <option value="all">All Categories</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-content-light-secondary">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark p-1.5 text-xs text-content-light-primary dark:text-content-dark-primary"
            >
              <option value="recent">Recently Updated</option>
              <option value="name">Workspace Name</option>
              <option value="documents">Document Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filtered.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface-light dark:bg-surface-dark rounded-2xl border border-dashed border-forest-200 dark:border-forest-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-400 flex items-center justify-center mx-auto">
            {isFavoritesView ? (
              <Star className="w-6 h-6 text-amber-500" />
            ) : (
              <FolderOpen className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary">
              {isFavoritesView
                ? 'No favorite workspaces found'
                : isSharedView
                ? 'No shared workspaces found'
                : 'No workspaces match your search'}
            </h3>
            <p className="text-xs text-content-light-secondary max-w-sm mx-auto">
              {isFavoritesView
                ? 'Click the star icon on any workspace card to add it to your favorites and access it quickly here.'
                : 'Try adjusting your search criteria or category filter.'}
            </p>
          </div>
          {isFavoritesView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/workspaces')}
            >
              Browse All Workspaces
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkspacesPage;
