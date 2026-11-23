import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileText,
  Users,
  Clock,
  Star,
  ArrowRight,
  MoreVertical,
  Layers,
  Terminal,
  Cloud,
  TrendingUp
} from 'lucide-react';
import Card, { CardContent } from '../common/Card';
import Badge from '../common/Badge';

/**
 * WorkspaceCard displays individual workspace information.
 * Demonstrates:
 * - Props passing
 * - Event propagation handling (e.stopPropagation for Star toggle)
 * - Dynamic icon mapping
 * - Navigation with useNavigate hook
 */
export function WorkspaceCard({
  workspace,
  onToggleFavorite,
  onDeleteWorkspace,
}) {
  const navigate = useNavigate();

  const iconMap = {
    Terminal: Terminal,
    Layers: Layers,
    TrendingUp: TrendingUp,
    Cloud: Cloud,
  };

  const IconComponent = iconMap[workspace.icon] || FolderKanban;

  return (
    <Card
      hoverEffect
      className="cursor-pointer group flex flex-col justify-between border-forest-100 dark:border-forest-900/60"
      onClick={() => navigate(`/workspaces/${workspace.id}`)}
    >
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Header row: Icon, Category & Favorite Toggle */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <Badge variant={workspace.role === 'Owner' ? 'owner' : workspace.role === 'Editor' ? 'editor' : 'viewer'}>
                {workspace.role}
              </Badge>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(workspace.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              workspace.isFavorite
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-content-light-muted dark:text-content-dark-muted hover:text-amber-500'
            }`}
            title={workspace.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${workspace.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Workspace Title & Description */}
        <h3 className="text-base font-semibold text-content-light-primary dark:text-content-dark-primary group-hover:text-forest-700 dark:group-hover:text-forest-300 transition-colors line-clamp-1">
          {workspace.name}
        </h3>
        <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {workspace.description}
        </p>

        {/* Workspace Metadata Footer */}
        <div className="mt-5 pt-3.5 border-t border-forest-50 dark:border-forest-900/40 flex items-center justify-between text-xs text-content-light-secondary dark:text-content-dark-secondary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Documents in this workspace">
              <FileText className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
              <span>{workspace.documentsCount} docs</span>
            </span>
            <span className="flex items-center gap-1.5" title="Collaborators">
              <Users className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
              <span>{workspace.membersCount} members</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-content-light-muted">
            <Clock className="w-3 h-3" />
            <span>{workspace.updatedAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkspaceCard;
