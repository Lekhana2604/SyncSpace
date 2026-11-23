import React from 'react';
import { Sparkles, FolderPlus, FileText, Users, Activity } from 'lucide-react';
import Button from '../common/Button';

/**
 * WelcomeHero banner on the dashboard.
 * Demonstrates: Props, Date calculations, responsive flex/grid layouts.
 */
export function WelcomeHero({ user, onNewWorkspace, stats }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 p-6 sm:p-8 text-white shadow-forest-lg mb-8">
      {/* Decorative Forest Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-forest-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-forest-200 text-xs font-medium tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sage" />
            <span>{currentDate} • SyncSpace Collaboration Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {user?.name || 'Engineer'}
          </h1>
          <p className="text-sm text-forest-200/90 max-w-xl mt-1.5 leading-relaxed">
            Your real-time workspace is active. Collaborate simultaneously on documents, organize team channels, and manage version snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={FolderPlus}
            onClick={onNewWorkspace}
            className="shadow-sm font-semibold"
          >
            Create Workspace
          </Button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="relative z-10 mt-8 pt-6 border-t border-forest-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-700/50 flex items-center justify-center text-forest-200">
            <FolderPlus className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats?.workspacesCount ?? 4}</p>
            <p className="text-[11px] text-forest-300">Active Workspaces</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-700/50 flex items-center justify-center text-forest-200">
            <FileText className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats?.documentsCount ?? 36}</p>
            <p className="text-[11px] text-forest-300">Documents</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-700/50 flex items-center justify-center text-forest-200">
            <Users className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats?.collaboratorsCount ?? 12}</p>
            <p className="text-[11px] text-forest-300">Team Collaborators</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-700/50 flex items-center justify-center text-forest-200">
            <Activity className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats?.revisionsCount ?? 84}</p>
            <p className="text-[11px] text-forest-300">Revisions Logged</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeHero;
