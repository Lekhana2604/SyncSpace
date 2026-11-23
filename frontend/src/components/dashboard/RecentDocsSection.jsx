import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Clock, Users, ArrowUpRight, Star } from 'lucide-react';
import Card, { CardContent } from '../common/Card';

export function RecentDocsSection({ documents, onToggleFavoriteDoc }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
          <FileText className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          Recent Documents
        </h2>
        <span className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
          Simultaneous real-time sync enabled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => navigate(`/workspaces/${doc.workspaceId}/documents/${doc.id}`)}
            className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-forest-100 dark:border-forest-900/60 hover:border-forest-300 dark:hover:border-forest-700/60 shadow-forest-sm hover:shadow-forest-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-medium text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/40 px-2 py-0.5 rounded">
                  {doc.workspaceName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-content-light-secondary dark:text-content-dark-secondary">
                    <Users className="w-3 h-3 text-emerald-500" />
                    <span>{doc.collaboratorsCount} active</span>
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary group-hover:text-forest-700 dark:group-hover:text-forest-300 transition-colors line-clamp-1">
                {doc.title}
              </h4>
              <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1 line-clamp-2 leading-relaxed">
                {doc.excerpt}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-forest-50 dark:border-forest-900/30 flex items-center justify-between text-[11px] text-content-light-secondary dark:text-content-dark-secondary">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {doc.updatedAt} by {doc.updatedBy}
              </span>
              <span className="flex items-center gap-1 text-forest-600 dark:text-forest-400 font-medium group-hover:translate-x-0.5 transition-transform">
                Open Editor <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentDocsSection;
