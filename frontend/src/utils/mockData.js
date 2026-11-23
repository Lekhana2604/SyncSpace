/**
 * Initial mock data for Phase 1 UI Foundation.
 * Accurately models the MySQL database schema designed for SyncSpace.
 */

export const INITIAL_WORKSPACES = [
  {
    id: 'ws_eng_01',
    name: 'Core Engineering & Architecture',
    description: 'System specifications, microservices blueprints, and technical RFCs.',
    icon: 'Terminal',
    documentsCount: 8,
    membersCount: 6,
    updatedAt: '12 minutes ago',
    isFavorite: true,
    role: 'Owner',
    tag: 'Engineering'
  },
  {
    id: 'ws_prod_02',
    name: 'Product Design & Roadmap 2026',
    description: 'Quarterly OKRs, user journey maps, UX research notes, and sprint planning.',
    icon: 'Layers',
    documentsCount: 14,
    membersCount: 10,
    updatedAt: '1 hour ago',
    isFavorite: true,
    role: 'Editor',
    tag: 'Product'
  },
  {
    id: 'ws_growth_03',
    name: 'Growth & Developer Relations',
    description: 'Developer documentation, launch playbooks, and partner onboarding guides.',
    icon: 'TrendingUp',
    documentsCount: 5,
    membersCount: 4,
    updatedAt: 'Yesterday',
    isFavorite: false,
    role: 'Viewer',
    tag: 'Marketing'
  },
  {
    id: 'ws_ops_04',
    name: 'Cloud Infrastructure & DevOps',
    description: 'Deployment guidelines, Docker compose manifests, and SLA incident logs.',
    icon: 'Cloud',
    documentsCount: 9,
    membersCount: 5,
    updatedAt: '3 days ago',
    isFavorite: false,
    role: 'Editor',
    tag: 'Operations'
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc_101',
    workspaceId: 'ws_eng_01',
    workspaceName: 'Core Engineering & Architecture',
    title: 'SyncSpace Architecture & WebSocket Synchronization Spec',
    excerpt: 'Detailed specification covering Yjs CRDT integration, Hocuspocus WebSocket gateway, and MySQL fallback persistence.',
    updatedAt: '10 mins ago',
    updatedBy: 'Alex Rivera',
    collaboratorsCount: 3,
    isFavorite: true
  },
  {
    id: 'doc_102',
    workspaceId: 'ws_eng_01',
    workspaceName: 'Core Engineering & Architecture',
    title: 'Database Schema & Indexing Optimizations',
    excerpt: 'Normalized relational table definitions, composite indexes, and foreign key cascades for real-time document revisions.',
    updatedAt: '2 hours ago',
    updatedBy: 'Sarah Chen',
    collaboratorsCount: 2,
    isFavorite: false
  },
  {
    id: 'doc_103',
    workspaceId: 'ws_prod_02',
    workspaceName: 'Product Design & Roadmap 2026',
    title: 'Forest Design System Tokens & Accessibility Guidelines',
    excerpt: 'Color palettes, contrast ratio verification, dark mode surface hierarchies, and typography scales using Inter.',
    updatedAt: 'Yesterday',
    updatedBy: 'Marcus Brody',
    collaboratorsCount: 4,
    isFavorite: true
  },
  {
    id: 'doc_104',
    workspaceId: 'ws_growth_03',
    workspaceName: 'Growth & Developer Relations',
    title: 'Developer Quickstart & Onboarding Playbook',
    excerpt: 'Step-by-step instructions for team members to clone repositories, setup local database instances, and run unit tests.',
    updatedAt: '4 days ago',
    updatedBy: 'Elena Rostova',
    collaboratorsCount: 1,
    isFavorite: false
  }
];

export const INITIAL_MEMBERS = [
  {
    id: 'usr_101',
    name: 'Alex Rivera',
    email: 'alex.rivera@syncspace.dev',
    role: 'Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: 'Jan 15, 2026'
  },
  {
    id: 'usr_102',
    name: 'Sarah Chen',
    email: 'sarah.chen@syncspace.dev',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: 'Jan 18, 2026'
  },
  {
    id: 'usr_103',
    name: 'Marcus Brody',
    email: 'marcus.brody@syncspace.dev',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    joinedDate: 'Feb 02, 2026'
  },
  {
    id: 'usr_104',
    name: 'Elena Rostova',
    email: 'elena.rostova@syncspace.dev',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: 'Feb 10, 2026'
  }
];

export const INITIAL_ACTIVITY = [
  {
    id: 'act_1',
    user: 'Alex Rivera',
    action: 'created document',
    target: 'SyncSpace Architecture & WebSocket Synchronization Spec',
    timestamp: '15 minutes ago',
    type: 'document'
  },
  {
    id: 'act_2',
    user: 'Sarah Chen',
    action: 'resolved a comment in',
    target: 'Database Schema & Indexing Optimizations',
    timestamp: '1 hour ago',
    type: 'comment'
  },
  {
    id: 'act_3',
    user: 'Marcus Brody',
    action: 'updated permissions for',
    target: 'Elena Rostova (Editor -> Viewer)',
    timestamp: '3 hours ago',
    type: 'member'
  },
  {
    id: 'act_4',
    user: 'Alex Rivera',
    action: 'saved revision snapshot v1.4 for',
    target: 'SyncSpace Architecture Spec',
    timestamp: 'Yesterday',
    type: 'version'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'New collaborator joined',
    description: 'Sarah Chen has joined the Core Engineering workspace.',
    timestamp: '25m ago',
    unread: true,
    type: 'team'
  },
  {
    id: 'notif_2',
    title: 'Comment mentioned you',
    description: 'Marcus Brody tagged you in "Forest Design System Tokens".',
    timestamp: '2h ago',
    unread: true,
    type: 'comment'
  },
  {
    id: 'notif_3',
    title: 'Document Revision Created',
    description: 'Snapshot v1.4 was successfully generated for Architecture Spec.',
    timestamp: '1d ago',
    unread: false,
    type: 'system'
  }
];
