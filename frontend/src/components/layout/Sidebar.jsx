import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Share2,
  Star,
  Activity,
  Bell,
  Settings,
  User,
  GraduationCap,
  Layers,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

/**
 * Forest-themed Sidebar Navigation.
 * Demonstrates:
 * - NavLink for active route highlighting (React Router)
 * - Conditional rendering and CSS class composition
 * - Context consumption (useAuth)
 * - Mobile responsive drawer overlay
 */
export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Workspaces', path: '/workspaces', icon: FolderKanban },
    { label: 'Shared With Me', path: '/shared', icon: Share2 },
    { label: 'Favorites', path: '/favorites', icon: Star },
    { label: 'Recent Activity', path: '/activity', icon: Activity },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: '2' },
  ];

  const secondaryNavItems = [
    { label: 'React Concepts Demo', path: '/react-concepts', icon: GraduationCap, highlight: true },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const navLinkClasses = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-forest-600 text-white shadow-forest-sm font-semibold'
        : 'text-forest-100/80 hover:text-white hover:bg-forest-800/60'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-forest-900 text-white border-r border-forest-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-forest-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-forest-600 group-hover:bg-forest-500 text-white flex items-center justify-center shadow-forest-md transition-all duration-200">
            <Layers className="w-5 h-5 text-forest-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white font-sans">SyncSpace</span>
              <span className="text-[10px] bg-forest-700/80 text-forest-200 px-1.5 py-0.2 rounded font-medium">v1.0</span>
            </div>
            <p className="text-[11px] text-forest-300/80 tracking-wide">Real-Time Workspace</p>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-forest-300 hover:text-white hover:bg-forest-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-forest-400/80 mb-2">
            Main Workspace
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={navLinkClasses}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-emerald-500 text-forest-950 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-forest-400/80 mb-2">
            System & Academic
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-forest-600 text-white font-semibold'
                        : item.highlight
                        ? 'bg-forest-800/40 text-emerald-300 hover:bg-forest-800/80 hover:text-white'
                        : 'text-forest-100/80 hover:text-white hover:bg-forest-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-90" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] uppercase font-bold bg-forest-700 text-forest-200 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Session Snippet */}
      {user && (
        <div className="p-3.5 m-3 rounded-xl bg-forest-800/60 border border-forest-700/60 flex items-center justify-between">
          <NavLink to="/profile" className="flex items-center gap-3 min-w-0">
            <Avatar name={user.name} src={user.avatar} size="sm" status="online" />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-forest-300 truncate">{user.email}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-forest-300 hover:text-white hover:bg-forest-700/80 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-forest-900 z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
