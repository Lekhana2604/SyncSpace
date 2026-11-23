import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TeamPage from '../pages/TeamPage';
import AcceptInvitePage from '../pages/AcceptInvitePage';
import DocumentCommentsDrawer from '../components/comments/DocumentCommentsDrawer';
import { AuthProvider } from '../context/AuthContext';

describe('Phase 5 Frontend: Team Management, Invitations & Comments', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('TeamPage Component', () => {
    it('renders team roster, roles, and opens invitation modal', async () => {
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/team/ws_eng_01']}>
            <Routes>
              <Route path="/team/:workspaceId" element={<TeamPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      // Verify title & Invite button
      expect(screen.getByText(/Team & Collaborator Permissions/i)).toBeInTheDocument();
      const inviteBtn = screen.getByRole('button', { name: /Invite Member/i });
      expect(inviteBtn).toBeInTheDocument();

      // Open Invite modal
      fireEvent.click(inviteBtn);
      expect(screen.getByText(/Invite New Collaborator/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/colleague@syncspace.dev/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Invitation Link/i })).toBeInTheDocument();
    });
  });

  describe('AcceptInvitePage Component', () => {
    it('renders invitation acceptance card with workspace details', async () => {
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/invite/test_token_123']}>
            <Routes>
              <Route path="/invite/:token" element={<AcceptInvitePage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      // Verify invitation verification or preview
      expect(
        await screen.findByText(/You've Been Invited to Collaborate/i, {}, { timeout: 3000 })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Accept Invitation/i })).toBeInTheDocument();
    });
  });

  describe('DocumentCommentsDrawer Component', () => {
    it('renders comments panel, supports adding a new comment', async () => {
      render(
        <AuthProvider>
          <DocumentCommentsDrawer documentId="doc_101" />
        </AuthProvider>
      );

      // Verify header
      expect(screen.getByText(/Discussion Comments/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Add a comment to this document/i)).toBeInTheDocument();

      // Type and submit comment
      const input = screen.getByPlaceholderText(/Add a comment to this document/i);
      fireEvent.change(input, {
        target: { value: 'Frontend automated test comment verification.' },
      });

      const postBtn = screen.getByRole('button', { name: /Post/i });
      fireEvent.click(postBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Frontend automated test comment verification/i)
        ).toBeInTheDocument();
      });
    });
  });
});
