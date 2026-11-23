import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CornerDownRight,
  CheckCircle2,
  RotateCcw,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

/**
 * DocumentCommentsDrawer
 * In-document collaborative discussion threads and nested replies.
 */
export function DocumentCommentsDrawer({ documentId, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active reply thread ID
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Load comments
  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/documents/${documentId}/comments`);
      if (res?.comments) {
        setComments(res.comments);
      }
    } catch (err) {
      console.warn('[Comments] Failed to fetch comments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadComments();
    }
  }, [documentId]);

  // Create new comment
  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setSubmitting(true);
      const res = await apiClient.post(`/documents/${documentId}/comments`, {
        content: newCommentText.trim(),
      });
      if (res?.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewCommentText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Create reply
  const handleCreateReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      setReplySubmitting(true);
      const res = await apiClient.post(`/comments/${commentId}/replies`, {
        content: replyText.trim(),
      });
      if (res?.reply) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, replies: [...(c.replies || []), res.reply] }
              : c
          )
        );
        setReplyText('');
        setActiveReplyId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Toggle resolve
  const handleToggleResolve = async (commentId) => {
    try {
      const res = await apiClient.patch(`/comments/${commentId}/resolve`);
      if (res?.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, is_resolved: res.is_resolved } : c
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update comment status.');
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const openCommentsCount = comments.filter((c) => !c.is_resolved).length;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 p-4 shadow-forest-md h-fit space-y-4 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-forest-50 dark:border-forest-900/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-forest-700 dark:text-forest-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-forest-700 dark:text-forest-400">
            Discussion Comments
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={openCommentsCount > 0 ? 'forest' : 'emerald'}>
            {openCommentsCount} Open
          </Badge>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-content-light-secondary hover:text-content-light-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleCreateComment} className="space-y-2">
        <textarea
          rows={2}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment to this document..."
          className="w-full text-xs p-2.5 rounded-xl border border-forest-200 dark:border-forest-800 bg-surface-light-subtle dark:bg-forest-950/40 outline-none focus:border-forest-600 resize-none text-content-light-primary dark:text-content-dark-primary"
        />
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            type="submit"
            icon={Send}
            loading={submitting}
            disabled={!newCommentText.trim()}
          >
            Post
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-forest-50 dark:bg-forest-900/30 rounded-xl" />
            <div className="h-16 bg-forest-50 dark:bg-forest-900/30 rounded-xl" />
          </div>
        ) : comments.length === 0 ? (
          <div className="p-6 text-center text-xs text-content-light-secondary space-y-1">
            <MessageSquare className="w-8 h-8 text-forest-300 dark:text-forest-700 mx-auto opacity-60" />
            <p className="font-semibold text-content-light-primary dark:text-content-dark-primary">
              No comments yet
            </p>
            <p className="text-[11px]">Start a discussion thread with your team.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-xl border transition-all text-xs space-y-2.5 ${
                comment.is_resolved
                  ? 'bg-forest-50/30 dark:bg-forest-950/20 border-forest-100 dark:border-forest-900/40 opacity-75'
                  : 'bg-surface-light-subtle dark:bg-forest-900/20 border-forest-100 dark:border-forest-800/80 shadow-xs'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={comment.author_name}
                    src={comment.author_avatar}
                    size="xs"
                  />
                  <div>
                    <span className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                      {comment.author_name}
                    </span>
                    <span className="text-[10px] text-content-light-muted ml-1.5">
                      {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleResolve(comment.id)}
                    className="p-1 rounded text-content-light-secondary hover:text-emerald-600 transition-colors cursor-pointer"
                    title={comment.is_resolved ? 'Reopen comment' : 'Mark as resolved'}
                  >
                    {comment.is_resolved ? (
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                  {comment.author_id === user?.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 rounded text-content-light-secondary hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <p className={`text-content-light-primary dark:text-content-dark-primary ${comment.is_resolved ? 'line-through text-content-light-muted' : ''}`}>
                {comment.content}
              </p>

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-3 border-l-2 border-forest-200 dark:border-forest-800 space-y-2 mt-2 pt-1">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-forest-800 dark:text-forest-200 text-[11px]">
                          {reply.author_name}
                        </span>
                        <span className="text-[9px] text-content-light-muted">
                          {reply.created_at ? new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-content-light-secondary dark:text-content-dark-secondary">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Button & Inline Form */}
              {activeReplyId === comment.id ? (
                <div className="pt-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark outline-none focus:border-forest-600"
                    autoFocus
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    loading={replySubmitting}
                    onClick={() => handleCreateReply(comment.id)}
                  >
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveReplyId(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setActiveReplyId(comment.id)}
                    className="text-[11px] font-medium text-forest-700 dark:text-forest-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    Reply
                  </button>
                  {comment.is_resolved && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Resolved
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentCommentsDrawer;
