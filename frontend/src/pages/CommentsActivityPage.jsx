import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Activity,
  CheckCircle2,
  Clock,
  Send,
  CornerDownRight,
  Filter,
  Users
} from 'lucide-react';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { INITIAL_ACTIVITY } from '../utils/mockData';
import apiClient from '../api/apiClient';

/**
 * Module 4: Comments and Workspace Activity Audit Log (Phase 5)
 */
export function CommentsActivityPage() {
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'activity'
  const [filterResolved, setFilterResolved] = useState('all'); // 'all' | 'open' | 'resolved'
  const [newCommentText, setNewCommentText] = useState('');
  const [activities, setActivities] = useState(INITIAL_ACTIVITY);

  const [comments, setComments] = useState([
    {
      id: 'comm_101',
      author: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      documentTitle: 'SyncSpace Architecture & WebSocket Synchronization Spec',
      documentId: 'doc_101',
      workspaceId: 'ws_eng_01',
      text: 'Should we configure Hocuspocus with SQLite or MySQL document update persistence for multi-node deployments?',
      timestamp: '1 hour ago',
      resolved: false,
      replies: [
        {
          id: 'rep_101',
          author: 'Alex Rivera',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: 'MySQL with connection pooling is configured and active in db.js for persistent binary updates!',
          timestamp: '30 mins ago',
        }
      ]
    },
    {
      id: 'comm_102',
      author: 'Marcus Brody',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      documentTitle: 'SyncSpace Architecture & WebSocket Synchronization Spec',
      documentId: 'doc_101',
      workspaceId: 'ws_eng_01',
      text: 'The CRDT convergence latency benchmark meets our sub-50ms SLA requirement.',
      timestamp: '2 hours ago',
      resolved: true,
      replies: []
    }
  ]);

  // Fetch real activity logs from backend
  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await apiClient.get('/workspaces/ws_eng_01/activity');
        if (res?.activities && res.activities.length > 0) {
          const mapped = res.activities.map((a) => ({
            id: a.id,
            user: a.user_name || 'Team Member',
            avatar: a.user_avatar,
            action: a.action_type.replace(/_/g, ' '),
            target: a.description,
            timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setActivities(mapped);
        }
      } catch {
        // Fallback to initial activity
      }
    }
    loadActivity();
  }, []);

  const handleToggleResolve = (commentId) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      author: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      documentTitle: 'SyncSpace Architecture & WebSocket Synchronization Spec',
      documentId: 'doc_101',
      workspaceId: 'ws_eng_01',
      text: newCommentText.trim(),
      timestamp: 'Just now',
      resolved: false,
      replies: [],
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const filteredComments = comments.filter((c) => {
    if (filterResolved === 'open') return !c.resolved;
    if (filterResolved === 'resolved') return c.resolved;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-forest-700 dark:text-forest-400" />
            Comments & Workspace Activity
          </h1>
          <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1">
            Track collaborative discussions, review feedback threads, and audit workspace event history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-surface-light-subtle dark:bg-forest-950/60 rounded-xl border border-forest-100 dark:border-forest-900/60 text-xs">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'text-content-light-secondary hover:text-content-light-primary'
            }`}
          >
            Discussions ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'text-content-light-secondary hover:text-content-light-primary'
            }`}
          >
            Audit Log ({activities.length})
          </button>
        </div>
      </div>

      {activeTab === 'comments' ? (
        <div className="space-y-4">
          {/* Filter options */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-content-light-secondary">Filter status:</span>
            {['all', 'open', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterResolved(status)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium cursor-pointer transition-colors ${
                  filterResolved === status
                    ? 'bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200'
                    : 'text-content-light-secondary hover:bg-forest-50 dark:hover:bg-forest-900/40'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Add comment box */}
          <form
            onSubmit={handleAddComment}
            className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-forest-100 dark:border-forest-900/60 shadow-forest-sm space-y-3"
          >
            <textarea
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Start a new discussion thread or leave feedback on a document..."
              className="w-full text-xs sm:text-sm rounded-lg border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark p-3 text-content-light-primary dark:text-content-dark-primary outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100 resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" icon={Send} disabled={!newCommentText.trim()}>
                Post Comment
              </Button>
            </div>
          </form>

          {/* Comment Threads */}
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border shadow-forest-sm transition-all ${
                  comment.resolved
                    ? 'border-forest-100 dark:border-forest-900/40 opacity-75'
                    : 'border-forest-200 dark:border-forest-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={comment.author} src={comment.avatar} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-content-light-primary dark:text-content-dark-primary">
                          {comment.author}
                        </span>
                        <span className="text-[10px] text-content-light-muted">• {comment.timestamp}</span>
                        {comment.resolved && <Badge variant="success">Resolved</Badge>}
                      </div>
                      <p className="text-[11px] text-forest-700 dark:text-forest-400 font-medium mt-0.5">
                        on "{comment.documentTitle}"
                      </p>
                      <p className="text-xs text-content-light-primary dark:text-content-dark-primary mt-2 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleResolve(comment.id)}
                    className="text-xs text-forest-600 dark:text-forest-400 hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {comment.resolved ? 'Reopen' : 'Resolve'}
                  </button>
                </div>

                {/* Nested Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-forest-50 dark:border-forest-900/40 pl-6 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5 text-xs">
                        <CornerDownRight className="w-3.5 h-3.5 text-forest-400 mt-1 flex-shrink-0" />
                        <Avatar name={reply.author} src={reply.avatar} size="xs" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                              {reply.author}
                            </span>
                            <span className="text-[10px] text-content-light-muted">{reply.timestamp}</span>
                          </div>
                          <p className="text-content-light-secondary dark:text-content-dark-secondary mt-0.5">
                            {reply.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Full Activity Audit Trail */
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 p-6 shadow-forest-sm space-y-4">
          <h2 className="text-sm font-semibold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
            <Activity className="w-4 h-4 text-forest-600 dark:text-forest-400" />
            Workspace Audit History
          </h2>
          <div className="divide-y divide-forest-50 dark:divide-forest-900/40">
            {activities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                    {act.user}
                  </span>{' '}
                  <span className="text-content-light-secondary capitalize">{act.action}</span>{' '}
                  <span className="font-medium text-forest-700 dark:text-forest-300">"{act.target}"</span>
                </div>
                <span className="text-[11px] text-content-light-muted">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentsActivityPage;
