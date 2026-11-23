import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle2,
  X,
  Check,
  Mail,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import apiClient from '../../api/apiClient';

/**
 * Top Navbar component for SyncSpace.
 * Features:
 * - Theme toggle consumption (Context API)
 * - Real-time notification center with unread counters & mark read
 * - State management with useState (dropdown toggles, search term)
 * - useRef and event listeners for click-outside dismissal
 * - Keyboard shortcuts (Ctrl+K search focus)
 */
export function TopNavbar({ onToggleMobileSidebar, onOpenCreateWorkspace }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load user notifications
  const loadNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Fallback notifications if offline
      setNotifications([
        {
          id: 'notif_101',
          title: 'New Member Joined',
          message: 'Sarah Chen accepted your invitation to join Core Engineering.',
          is_read: false,
          type: 'invitation',
          created_at: new Date(Date.now() - 1500000),
        },
        {
          id: 'notif_102',
          title: 'New Comment on Document',
          message: 'Marcus Brody commented on "SyncSpace Architecture".',
          is_read: false,
          type: 'comment',
          created_at: new Date(Date.now() - 3600000),
        },
      ]);
      setUnreadCount(2);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/workspaces?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('[Notif] Error marking as read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('[Notif] Error marking all as read:', err.message);
    }
  };

  const handleDismissNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => {
        const target = notifications.find((n) => n.id === id);
        return target && !target.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.warn('[Notif] Error dismissing:', err.message);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-surface-light dark:bg-surface-dark border-b border-forest-100 dark:border-forest-900/60 transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Mobile toggle & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-content-light-secondary dark:text-content-dark-secondary hover:bg-forest-50 dark:hover:bg-forest-900/40"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-light-secondary dark:text-content-dark-secondary" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces, documents, members... (Ctrl + K)"
              className="w-full text-xs sm:text-sm pl-9 pr-14 py-2 rounded-xl bg-surface-light-subtle dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/70 text-content-light-primary dark:text-content-dark-primary placeholder:text-content-light-secondary focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 transition-all"
            />
            <kbd className="hidden sm:inline-flex items-center absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-content-light-secondary dark:text-content-dark-secondary bg-surface-light dark:bg-surface-dark px-1.5 py-0.5 rounded border border-forest-100 dark:border-forest-900">
              Ctrl K
            </kbd>
          </form>
        </div>

        {/* Right Section: Actions, Notifications, Theme toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Workspace Quick Button */}
          {onOpenCreateWorkspace && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenCreateWorkspace}
              className="hidden sm:inline-flex"
            >
              New Workspace
            </Button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg text-content-light-secondary dark:text-content-dark-secondary hover:text-forest-700 dark:hover:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-900/50 transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-forest-700 animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* Notification Menu */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen((prev) => !prev);
                loadNotifications();
              }}
              aria-label="View notifications"
              className="p-2 rounded-lg text-content-light-secondary dark:text-content-dark-secondary hover:text-forest-700 dark:hover:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-900/50 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 ? (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-forest-400 opacity-60" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-forest-lg border border-forest-100 dark:border-forest-900/80 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-forest-50 dark:border-forest-900/40">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-content-light-primary dark:text-content-dark-primary">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-medium text-forest-700 dark:text-forest-300 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="py-1 space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-content-light-muted">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-2.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-2 cursor-pointer ${
                          n.is_read
                            ? 'bg-transparent border-transparent hover:bg-forest-50/50 dark:hover:bg-forest-900/20 opacity-75'
                            : 'bg-forest-50/60 dark:bg-forest-950/40 border-forest-100 dark:border-forest-900/60 font-medium'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-surface-light dark:bg-surface-dark text-forest-700 dark:text-forest-300 mt-0.5 shrink-0">
                            {n.type === 'invitation' ? (
                              <Mail className="w-3.5 h-3.5" />
                            ) : n.type === 'comment' ? (
                              <MessageSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-content-light-primary dark:text-content-dark-primary text-[11px]">
                                {n.title}
                              </p>
                              {!n.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-content-light-secondary dark:text-content-dark-secondary mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-content-light-muted mt-1 block">
                              {n.created_at
                                ? new Date(n.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Recently'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDismissNotif(n.id, e)}
                          className="p-1 text-content-light-muted hover:text-content-light-primary rounded"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-forest-50 dark:border-forest-900/40 text-center">
                  <NavLink
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-medium text-forest-700 dark:text-forest-400 hover:underline block"
                  >
                    View Complete Activity Audit Log
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-forest-200 dark:bg-forest-800 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-forest-50 dark:hover:bg-forest-900/50 transition-colors cursor-pointer"
              aria-label="User profile menu"
            >
              <Avatar
                name={user?.name || 'Alex Rivera'}
                src={user?.avatar}
                size="sm"
                status="online"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-content-light-primary dark:text-content-dark-primary leading-tight">
                  {user?.name || 'Alex Rivera'}
                </p>
                <p className="text-[10px] text-content-light-secondary dark:text-content-dark-secondary">
                  {user?.role || 'Owner'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-content-light-secondary hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-light dark:bg-surface-dark rounded-xl shadow-forest-lg border border-forest-100 dark:border-forest-900/80 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-forest-50 dark:border-forest-900/40">
                  <p className="text-xs font-semibold text-content-light-primary dark:text-content-dark-primary">
                    {user?.name || 'Alex Rivera'}
                  </p>
                  <p className="text-[11px] text-content-light-secondary truncate">
                    {user?.email || 'alex.rivera@syncspace.dev'}
                  </p>
                </div>
                <div className="py-1">
                  <NavLink
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-content-light-primary dark:text-content-dark-primary hover:bg-forest-50 dark:hover:bg-forest-900/40 rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-content-light-primary dark:text-content-dark-primary hover:bg-forest-50 dark:hover:bg-forest-900/40 rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                    <span>Workspace Settings</span>
                  </NavLink>
                </div>
                <div className="pt-1 border-t border-forest-50 dark:border-forest-900/40">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
