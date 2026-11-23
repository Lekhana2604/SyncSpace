import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import WorkspacesPage from '../pages/WorkspacesPage';

describe('Favorites Filter in WorkspacesPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('displays only starred workspaces on /favorites route and excludes unstarred ones', () => {
    render(
      <AuthProvider>
        <WorkspaceProvider>
          <MemoryRouter initialEntries={['/favorites']}>
            <Routes>
              <Route path="/favorites" element={<WorkspacesPage />} />
            </Routes>
          </MemoryRouter>
        </WorkspaceProvider>
      </AuthProvider>
    );

    // Title should be Favorite Workspaces
    expect(screen.getByText('Favorite Workspaces')).toBeInTheDocument();

    // Starred workspaces in INITIAL_WORKSPACES:
    // 1. Core Engineering & Architecture (isFavorite: true)
    // 2. Product Design & Roadmap 2026 (isFavorite: true)
    expect(screen.getByText('Core Engineering & Architecture')).toBeInTheDocument();
    expect(screen.getByText('Product Design & Roadmap 2026')).toBeInTheDocument();

    // Unstarred workspaces in INITIAL_WORKSPACES:
    // 3. Growth & Developer Relations (isFavorite: false)
    // 4. Cloud Infrastructure & DevOps (isFavorite: false)
    expect(screen.queryByText('Growth & Developer Relations')).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud Infrastructure & DevOps')).not.toBeInTheDocument();
  });
});
