import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Users,
  ChevronDown,
  Eye
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export const COLLAB_COLORS = [
  '#205C49', // Forest Dark
  '#328565', // Forest Emerald
  '#10B981', // Emerald
  '#0D9488', // Teal
  '#0284C7', // Sky Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
];

/**
 * Returns a stable, deterministic color from the Forest design palette
 * for a user based on their unique ID or name string.
 */
export function getCollaboratorColor(identifier = '') {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  return COLLAB_COLORS[Math.abs(hash) % COLLAB_COLORS.length];
}

/**
 * CollaborativeEditor
 * Real-time rich-text editor powered by Tiptap, Yjs CRDTs, and Hocuspocus WebSockets.
 *
 * Implements:
 * - Simultaneous multi-user live editing with convergence
 * - Live collaborator cursor carets & colored selection tags
 * - Real-time user presence awareness stack
 * - Dual persistence: WebSocket binary CRDTs (yjs_documents) + REST API autosave (MySQL documents table)
 * - Offline graceful fallback if collaboration server is offline
 */
export function CollaborativeEditor({
  documentId,
  workspaceId,
  initialDocData,
  onTitleUpdate,
  readOnly = false,
}) {
  const { user } = useAuth();

  // Document state
  const [title, setTitle] = useState(initialDocData?.title || 'Untitled Document');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'offline'
  const [lastSavedTime, setLastSavedTime] = useState('');
  const saveTimeoutRef = useRef(null);

  // Collaboration status & presence
  const [collabStatus, setCollabStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [showCollaboratorsList, setShowCollaboratorsList] = useState(false);

  // Stable collaborator color
  const currentUserColor = useMemo(
    () => getCollaboratorColor(user?.id || user?.name || 'guest'),
    [user]
  );

  // 1. Initialize Yjs Doc
  const ydoc = useMemo(() => new Y.Doc(), [documentId]);

  // 2. Initialize Hocuspocus WebSocket Provider
  const provider = useMemo(() => {
    const hasWebSocket = typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined';
    if (!hasWebSocket) {
      setCollabStatus('disconnected');
      return null;
    }

    const wsUrl = import.meta.env.VITE_COLLAB_WS_URL || 'ws://localhost:1234';
    const token = localStorage.getItem('syncspace_token') || 'demo-test-token';

    try {
      const p = new HocuspocusProvider({
        url: wsUrl,
        name: `doc_${documentId}`,
        document: ydoc,
        token: token,
        onStatus: ({ status }) => {
          setCollabStatus(status);
        },
        onSynced: () => {
          // If Yjs document is empty, seed it with existing initial HTML
          if (ydoc.getXmlFragment('default').length === 0 && initialDocData?.content) {
            // Document will initialize below
          }
        },
      });
      return p;
    } catch (err) {
      console.warn('[CollabEditor] Provider init error:', err.message);
      setCollabStatus('disconnected');
      return null;
    }
  }, [documentId, ydoc]);

  // 3. Bind User Awareness (Presence & Cursor Colors)
  useEffect(() => {
    if (!provider) return;

    provider.setAwarenessField('user', {
      id: user?.id || `usr_${Date.now()}`,
      name: user?.name || 'Anonymous Collaborator',
      color: currentUserColor,
      avatar: user?.avatar || null,
    });

    const handleAwarenessUpdate = () => {
      if (!provider?.awareness) return;
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .map((s) => s.user)
        .filter(Boolean);

      // Deduplicate by user ID
      const unique = [];
      const seen = new Set();
      for (const u of users) {
        const key = u.id || u.name;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(u);
        }
      }
      setActiveCollaborators(unique);
    };

    provider.on('awarenessUpdate', handleAwarenessUpdate);
    handleAwarenessUpdate();

    return () => {
      provider.off('awarenessUpdate', handleAwarenessUpdate);
    };
  }, [provider, user, currentUserColor]);

  // 4. Initialize Tiptap Editor with Collaboration Extensions
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        // Turn off local history; Yjs handles distributed undo/redo collaboratively
        undoRedo: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // Yjs real-time document synchronization
      Collaboration.configure({
        document: ydoc,
      }),
      // Live collaborator cursors & carets
      ...(provider
        ? [
            CollaborationCaret.configure({
              provider: provider,
              user: {
                name: user?.name || 'Anonymous Collaborator',
                color: currentUserColor,
              },
            }),
          ]
        : []),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap text-content-light-primary dark:text-content-dark-primary focus:outline-none p-6 sm:p-10',
      },
    },
    onUpdate({ editor }) {
      triggerAutosave(title, editor.getHTML());
    },
  }, [documentId, ydoc, provider, currentUserColor, readOnly]);

  // Seed editor content from MySQL if Yjs is empty on initial load
  useEffect(() => {
    if (initialDocData?.title) {
      setTitle(initialDocData.title);
    }
    if (!editor) return;

    const xmlFragment = ydoc.getXmlFragment('default');
    if (xmlFragment.length === 0 && initialDocData?.content) {
      editor.commands.setContent(initialDocData.content);
    }
  }, [editor, initialDocData, ydoc]);

  // 5. Cleanup on unmount or document switch
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (provider) {
        provider.destroy();
      }
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  // 6. Dual-Persistence Debounced Autosave (MySQL REST API)
  const triggerAutosave = (currentTitle, currentContent) => {
    if (readOnly) return;
    setSaveStatus('saving');
    localStorage.setItem(`syncspace_doc_title_${documentId}`, currentTitle);
    localStorage.setItem(`syncspace_doc_content_${documentId}`, currentContent);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await apiClient.put(`/documents/${documentId}`, {
          title: currentTitle,
          content: currentContent,
        });
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (onTitleUpdate) onTitleUpdate(currentTitle);
      } catch (err) {
        console.warn('[Autosave] REST API offline. Changes preserved in browser and Yjs CRDTs.', err.message);
        setSaveStatus('offline');
      }
    }, 700);
  };

  const handleTitleChange = (e) => {
    if (readOnly) return;
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (editor) {
      triggerAutosave(newTitle, editor.getHTML());
    }
  };

  // Helper for formatting button styling
  const getBtnClass = (isActive, disabled = false) =>
    `p-1.5 rounded-lg transition-all duration-150 select-none flex items-center justify-center cursor-pointer ${
      disabled
        ? 'opacity-35 cursor-not-allowed text-content-light-muted'
        : isActive
        ? 'bg-forest-700 text-white shadow-xs font-bold'
        : 'text-content-light-secondary dark:text-content-dark-secondary hover:bg-forest-100 dark:hover:bg-forest-900/60 hover:text-content-light-primary dark:hover:text-content-dark-primary'
    }`;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 shadow-forest-md overflow-hidden">
      {/* Real-time Collaboration Sub-Header Bar */}
      <div className="px-4 py-2.5 bg-forest-50/60 dark:bg-forest-950/40 border-b border-forest-100 dark:border-forest-900/60 flex items-center justify-between gap-3 flex-wrap text-xs">
        {/* Left: Connection Status Badge */}
        <div className="flex items-center gap-3">
          {collabStatus === 'connected' ? (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span>Live Collab Sync (ws://localhost:1234)</span>
            </div>
          ) : collabStatus === 'connecting' ? (
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Connecting to Collab Server...</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 text-content-light-secondary dark:text-content-dark-secondary bg-surface-light-subtle dark:bg-forest-900/30 px-2.5 py-1 rounded-full border border-forest-200 dark:border-forest-800"
              title="Collaboration server is offline. Changes are saved locally and to MySQL REST API."
            >
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Offline Mode (Local & REST Autosave)</span>
            </div>
          )}
        </div>

        {/* Right: Active Collaborators Presence & Autosave Status */}
        <div className="flex items-center gap-3">
          {/* Active Collaborator Avatar Stack */}
          <div className="relative">
            <button
              onClick={() => setShowCollaboratorsList(!showCollaboratorsList)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-light dark:bg-surface-dark border border-forest-200 dark:border-forest-800 hover:border-forest-400 transition-colors cursor-pointer"
              title="Click to view all active collaborators"
            >
              <div className="flex items-center -space-x-2 overflow-hidden">
                {activeCollaborators.length > 0 ? (
                  activeCollaborators.slice(0, 4).map((c, i) => (
                    <div
                      key={c.id || i}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white dark:ring-surface-dark overflow-hidden"
                      style={{ backgroundColor: c.color || '#328565' }}
                      title={`${c.name}${c.id === user?.id ? ' (You)' : ''}`}
                    >
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        c.name?.slice(0, 2).toUpperCase() || 'U'
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white dark:ring-surface-dark"
                    style={{ backgroundColor: currentUserColor }}
                  >
                    {user?.name?.slice(0, 2).toUpperCase() || 'ME'}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-forest-800 dark:text-forest-200 pl-1">
                {Math.max(1, activeCollaborators.length)} {Math.max(1, activeCollaborators.length) === 1 ? 'Editor' : 'Editors'}
              </span>
              <ChevronDown className="w-3 h-3 text-content-light-secondary" />
            </button>

            {/* Active Collaborators Dropdown Popover */}
            {showCollaboratorsList && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-surface-light dark:bg-surface-dark rounded-xl border border-forest-200 dark:border-forest-800 shadow-forest-lg p-3 z-30 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-forest-50 dark:border-forest-900/40 text-xs font-bold text-forest-800 dark:text-forest-200">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-forest-600" />
                    Active in Document
                  </span>
                  <Badge variant="forest">{Math.max(1, activeCollaborators.length)} Online</Badge>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activeCollaborators.length > 0 ? (
                    activeCollaborators.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color || '#328565' }}
                          />
                          <span className="font-medium text-content-light-primary dark:text-content-dark-primary truncate">
                            {c.name} {c.id === user?.id ? '(You)' : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Editing
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-1.5 text-xs text-content-light-secondary">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentUserColor }} />
                      <span>{user?.name || 'You'} (Active)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MySQL Autosave Status */}
          <div className="text-xs flex items-center gap-1.5 select-none pl-2 border-l border-forest-200 dark:border-forest-800">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Saving to MySQL...
              </span>
            ) : saveStatus === 'offline' ? (
              <span
                className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300 font-medium"
                title="Saved locally in browser cache and Yjs store"
              >
                <Clock className="w-3.5 h-3.5" />
                Saved locally
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved to MySQL {lastSavedTime ? `(${lastSavedTime})` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tiptap Formatting Toolbar (hidden in View-Only mode) */}
      {!readOnly && editor && (
        <div className="p-2 bg-surface-light-subtle dark:bg-forest-950/60 border-b border-forest-100 dark:border-forest-900/60 flex items-center gap-1 flex-wrap text-xs">
          {/* Collaborative Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={getBtnClass(false, !editor.can().undo())}
            title="Collaborative Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={getBtnClass(false, !editor.can().redo())}
            title="Collaborative Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-forest-200 dark:bg-forest-800 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={getBtnClass(editor.isActive('heading', { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={getBtnClass(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={getBtnClass(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-forest-200 dark:bg-forest-800 mx-1" />

          {/* Text Formatting: Bold, Italic, Underline, Strike, Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={getBtnClass(editor.isActive('bold'))}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={getBtnClass(editor.isActive('italic'))}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={getBtnClass(editor.isActive('underline'))}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={getBtnClass(editor.isActive('strike'))}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={getBtnClass(editor.isActive('code'))}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-forest-200 dark:bg-forest-800 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getBtnClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getBtnClass(editor.isActive('orderedList'))}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={getBtnClass(editor.isActive('blockquote'))}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-forest-200 dark:bg-forest-800 mx-1" />

          {/* Table & Divider */}
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            className={getBtnClass(editor.isActive('table'))}
            title="Insert 3x3 Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={getBtnClass(false)}
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View-Only Alert Banner */}
      {readOnly && (
        <div className="mx-6 sm:mx-10 mt-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
          <Eye className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>View-Only Mode:</strong> You have Viewer permissions in this workspace. Direct editing and formatting are disabled.
          </span>
        </div>
      )}

      {/* Document Content Canvas */}
      <div className="p-6 sm:p-10 space-y-4 min-h-[500px]">
        {/* Editable Title */}
        <input
          type="text"
          value={title}
          disabled={readOnly}
          readOnly={readOnly}
          onChange={handleTitleChange}
          placeholder="Untitled Document..."
          className={`w-full text-2xl sm:text-3xl font-extrabold text-content-light-primary dark:text-content-dark-primary bg-transparent outline-none border-b border-transparent pb-2 transition-colors ${
            readOnly ? 'cursor-default' : 'focus:border-forest-300 dark:focus:border-forest-700'
          }`}
        />

        {/* Tiptap Rich-Text Editor Content Area */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default CollaborativeEditor;
