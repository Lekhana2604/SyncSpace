import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentVersionsDrawer from '../components/versions/DocumentVersionsDrawer';
import TopNavbar from '../components/layout/TopNavbar';
import VersionHistorySettingsPage from '../pages/VersionHistorySettingsPage';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

describe('Phase 6 Frontend: Version History, Notifications & Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('DocumentVersionsDrawer Component', () => {
    it('renders snapshot history list and opens create snapshot modal', async () => {
      render(
        <AuthProvider>
          <DocumentVersionsDrawer documentId="doc_101" />
        </AuthProvider>
      );

      // Verify title & Save Current Version button
      expect(screen.getByText(/Version Snapshots/i)).toBeInTheDocument();
      const saveBtn = screen.getByRole('button', { name: /Save Current Version/i });
      expect(saveBtn).toBeInTheDocument();

      // Open Create Snapshot modal
      fireEvent.click(saveBtn);
      expect(screen.getByText(/Create Version Snapshot/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/v2.0 - Completed Architecture Draft/i)).toBeInTheDocument();
    });
  });

  describe('TopNavbar Notifications', () => {
    it('renders notification bell and toggles notifications popover', async () => {
      render(
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>
              <TopNavbar />
            </MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      );

      const bellBtn = screen.getByLabelText(/View notifications/i);
      expect(bellBtn).toBeInTheDocument();

      // Toggle notifications dropdown
      fireEvent.click(bellBtn);

      await waitFor(() => {
        expect(screen.getByText(/View Complete Activity Audit Log/i)).toBeInTheDocument();
      });
    });
  });

  describe('VersionHistorySettingsPage Component', () => {
    it('renders workspace settings and appearance tabs', async () => {
      render(
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>
              <VersionHistorySettingsPage />
            </MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      );

      expect(screen.getByText(/Settings & Version History/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Core Engineering & Architecture/i)).toBeInTheDocument();

      // Switch to Forest Theme Tokens tab
      const appearanceTab = screen.getByRole('button', { name: /Forest Theme Tokens/i });
      fireEvent.click(appearanceTab);

      expect(screen.getByText(/Forest Light Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Deep Forest Dark Mode/i)).toBeInTheDocument();
    });
  });
});
