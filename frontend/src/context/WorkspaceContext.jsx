import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { INITIAL_WORKSPACES } from '../utils/mockData';
import { useAuth } from './AuthContext';

/**
 * WorkspaceContext manages workspace collections, creation, deletion,
 * and starred favorites.
 * Synchronizes with Express REST API:
 * - GET    /api/workspaces
 * - POST   /api/workspaces
 * - PATCH  /api/workspaces/:id/favorite
 * - DELETE /api/workspaces/:id
 */
const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('syncspace_workspaces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_WORKSPACES;
      }
    }
    return INITIAL_WORKSPACES;
  });

  const [loading, setLoading] = useState(false);

  // Synchronize with backend API on mount or auth change
  useEffect(() => {
    async function loadWorkspaces() {
      if (!isAuthenticated) return;
      setLoading(true);

      try {
        const data = await apiClient.get('/workspaces');
        if (data?.workspaces && Array.isArray(data.workspaces)) {
          setWorkspaces(data.workspaces);
          localStorage.setItem('syncspace_workspaces', JSON.stringify(data.workspaces));
        }
      } catch (err) {
        console.warn('[WorkspaceContext] Backend workspaces fetch error or offline. Using local cache.', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, [isAuthenticated]);

  // Synchronize local changes to localStorage
  useEffect(() => {
    localStorage.setItem('syncspace_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  const toggleFavorite = async (id) => {
    // 1. Optimistic UI update
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, isFavorite: !ws.isFavorite } : ws))
    );

    // 2. Call backend API
    try {
      await apiClient.patch(`/workspaces/${id}/favorite`);
    } catch (err) {
      // Backend offline or error, optimistic update remains in local cache
    }
  };

  const addWorkspace = async (newWs) => {
    try {
      // 1. Call backend API
      const data = await apiClient.post('/workspaces', newWs);
      if (data?.workspace) {
        setWorkspaces((prev) => [data.workspace, ...prev]);
        return data.workspace;
      }
    } catch (err) {
      console.warn('[WorkspaceContext] Backend create offline, saving locally.', err.message);
    }

    // Fallback local create
    const created = {
      id: `ws_${Date.now()}`,
      name: newWs.name,
      description: newWs.description || 'Collaborative workspace.',
      icon: 'FolderKanban',
      documentsCount: 0,
      membersCount: 1,
      updatedAt: 'Just now',
      isFavorite: false,
      role: 'Owner',
      tag: newWs.tag || 'Engineering',
    };
    setWorkspaces((prev) => [created, ...prev]);
    return created;
  };

  const deleteWorkspace = async (id) => {
    // 1. Optimistic local delete
    setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));

    // 2. Call backend API
    try {
      await apiClient.delete(`/workspaces/${id}`);
    } catch (err) {
      console.warn('[WorkspaceContext] Backend delete offline.', err.message);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        loading,
        toggleFavorite,
        addWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      workspaces: INITIAL_WORKSPACES,
      loading: false,
      toggleFavorite: () => {},
      addWorkspace: () => {},
      deleteWorkspace: () => {},
    };
  }
  return context;
}

export const useWorkspace = useWorkspaces;

export default WorkspaceContext;
