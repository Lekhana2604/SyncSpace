import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollaborativeEditor, { getCollaboratorColor, COLLAB_COLORS } from '../components/editor/CollaborativeEditor';
import { AuthProvider } from '../context/AuthContext';

describe('CollaborativeEditor Component (Tiptap + Yjs + Presence)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates consistent deterministic Forest theme colors for collaborators', () => {
    const colorAlice1 = getCollaboratorColor('usr_101');
    const colorAlice2 = getCollaboratorColor('usr_101');
    const colorBob = getCollaboratorColor('usr_102');

    expect(colorAlice1).toBe(colorAlice2);
    expect(COLLAB_COLORS).toContain(colorAlice1);
    expect(COLLAB_COLORS).toContain(colorBob);
  });

  it('renders collaborative editor with presence indicators and formatting controls', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <CollaborativeEditor
            documentId="doc_test_101"
            workspaceId="ws_eng_01"
            initialDocData={{
              id: 'doc_test_101',
              title: 'Collaborative RFC: Real-Time CRDT Architecture',
              content: '<p>Testing live collaboration</p>',
            }}
          />
        </MemoryRouter>
      </AuthProvider>
    );

    // Verify collaborator count / presence badge
    expect(screen.getByText(/1 Editor/i)).toBeInTheDocument();

    // Verify title is rendered
    expect(
      screen.getByDisplayValue(/Collaborative RFC: Real-Time CRDT Architecture/i)
    ).toBeInTheDocument();

    // Verify collaborative undo/redo buttons with custom tooltips
    expect(screen.getByTitle(/Collaborative Undo/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Collaborative Redo/i)).toBeInTheDocument();

    // Verify formatting tools exist
    expect(screen.getByTitle(/Bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Underline/i)).toBeInTheDocument();

    // Verify collaborator dropdown toggles
    const presenceBtn = screen.getByTitle(/Click to view all active collaborators/i);
    fireEvent.click(presenceBtn);

    expect(screen.getByText(/Active in Document/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Online/i)).toBeInTheDocument();
  });
});
