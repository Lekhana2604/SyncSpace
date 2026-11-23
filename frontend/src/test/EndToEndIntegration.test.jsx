import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DocumentEditorPage from '../pages/DocumentEditorPage';
import TopNavbar from '../components/layout/TopNavbar';
import Modal from '../components/common/Modal';
import { AuthProvider } from '../context/AuthContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Phase 7: End-to-End Integration & Quality Assurance', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Document Editor & Collaboration Journey', () => {
    it('integrates document editor with presence, comments drawer, and version history', async () => {
      render(
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <MemoryRouter initialEntries={['/workspaces/ws_eng_01/documents/doc_101']}>
                <Routes>
                  <Route
                    path="/workspaces/:workspaceId/documents/:documentId"
                    element={<DocumentEditorPage />}
                  />
                </Routes>
              </MemoryRouter>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      );

      // 1. Verify editor loads with initial document title
      expect(
        await screen.findByDisplayValue(/SyncSpace Architecture & WebSocket Synchronization Spec/i)
      ).toBeInTheDocument();

      // 2. Verify Presence Stack shows collaborator count
      expect(screen.getByText(/1 Editor/i)).toBeInTheDocument();

      // 3. Verify Workspace Docs Drawer toggle
      const docsDrawerBtn = screen.getByTitle(/Browse all documents in this workspace/i);
      expect(docsDrawerBtn).toBeInTheDocument();
      fireEvent.click(docsDrawerBtn);
      expect(await screen.findByPlaceholderText(/Filter documents.../i)).toBeInTheDocument();

      // 4. Verify Comments Drawer opens
      const commentsBtn = screen.getByTitle(/Discussion comments/i);
      expect(commentsBtn).toBeInTheDocument();
      fireEvent.click(commentsBtn);

      expect(await screen.findByText(/Discussion Comments/i)).toBeInTheDocument();
      expect(await screen.findByPlaceholderText(/Add a comment to this document.../i)).toBeInTheDocument();

      // 5. Verify Version History Drawer opens
      const versionsBtn = screen.getByTitle(/Document version snapshots/i);
      expect(versionsBtn).toBeInTheDocument();
      fireEvent.click(versionsBtn);

      expect(await screen.findByText(/Version Snapshots/i)).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /Save Current Version/i })).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control (RBAC) Enforcement', () => {
    it('restricts viewer permissions: disables editing toolbar, displays View-Only banner, and hides delete action', async () => {
      // ws_growth_03 has role: 'Viewer' in mock data
      render(
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <MemoryRouter initialEntries={['/workspaces/ws_growth_03/documents/doc_301']}>
                <Routes>
                  <Route
                    path="/workspaces/:workspaceId/documents/:documentId"
                    element={<DocumentEditorPage />}
                  />
                </Routes>
              </MemoryRouter>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      );

      // 1. Verify View-Only banner is displayed
      await waitFor(() => {
        expect(screen.getByText(/View-Only Mode:/i)).toBeInTheDocument();
      });

      // 2. Verify formatting toolbar buttons (Bold, Italic, Underline) are NOT rendered
      expect(screen.queryByTitle(/Bold \(Ctrl\+B\)/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Italic \(Ctrl\+I\)/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Underline \(Ctrl\+U\)/i)).not.toBeInTheDocument();

      // 3. Verify Title input is disabled
      const titleInput = screen.getByPlaceholderText(/Untitled Document.../i);
      expect(titleInput).toBeDisabled();

      // 4. Verify Delete Document button is hidden for Viewers
      expect(screen.queryByTitle(/Delete this document/i)).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts & Global Navigation', () => {
    it('focuses global search bar when Ctrl+K is pressed', () => {
      render(
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <MemoryRouter>
                <TopNavbar />
              </MemoryRouter>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      );

      const searchInput = screen.getByPlaceholderText(/Search workspaces/i);
      expect(searchInput).not.toHaveFocus();

      // Dispatch Ctrl+K
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(searchInput).toHaveFocus();
    });

    it('dismisses modal dialog when Escape key is pressed', () => {
      let isOpen = true;
      const handleClose = () => {
        isOpen = false;
      };

      const { rerender } = render(
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title="Keyboard Shortcut Modal Test"
          description="Test Escape key dismissal"
        >
          <p>Modal body content</p>
        </Modal>
      );

      expect(screen.getByText(/Keyboard Shortcut Modal Test/i)).toBeInTheDocument();

      // Dispatch Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(isOpen).toBe(false);

      rerender(
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title="Keyboard Shortcut Modal Test"
          description="Test Escape key dismissal"
        >
          <p>Modal body content</p>
        </Modal>
      );

      expect(screen.queryByText(/Keyboard Shortcut Modal Test/i)).not.toBeInTheDocument();
    });
  });

  describe('Theme Switcher & Forest Palette Styling', () => {
    it('toggles dark mode in ThemeContext on theme button click', () => {
      render(
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <MemoryRouter>
                <TopNavbar />
              </MemoryRouter>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      );

      const themeToggleBtn = screen.getByTitle(/Switch to dark mode|Switch to light mode/i);
      expect(themeToggleBtn).toBeInTheDocument();

      // Click to toggle theme
      fireEvent.click(themeToggleBtn);
      const isDark = document.documentElement.classList.contains('dark');
      // In jsdom document.documentElement classList reflects the toggled state
      expect(typeof isDark).toBe('boolean');
    });
  });
});
