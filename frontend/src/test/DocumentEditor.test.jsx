import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DocumentEditorPage from '../pages/DocumentEditorPage';

describe('DocumentEditorPage with Tiptap Editor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders formatting toolbar with Bold, Italic, Underline, and Headings', async () => {
    render(
      <MemoryRouter initialEntries={['/workspaces/ws_eng_01/documents/doc_101']}>
        <Routes>
          <Route
            path="/workspaces/:workspaceId/documents/:documentId"
            element={<DocumentEditorPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Verify toolbar action buttons exist
    expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/underline/i)).toBeInTheDocument();
    expect(screen.getByTitle(/heading 1/i)).toBeInTheDocument();
    expect(screen.getByTitle(/heading 2/i)).toBeInTheDocument();
    expect(screen.getByTitle(/bullet list/i)).toBeInTheDocument();
    expect(screen.getByTitle(/numbered list/i)).toBeInTheDocument();
    expect(screen.getByTitle(/blockquote/i)).toBeInTheDocument();
    expect(screen.getByTitle(/insert 3x3 table/i)).toBeInTheDocument();

    // Verify document editable title input appears after load
    expect(
      await screen.findByDisplayValue(/SyncSpace Architecture & WebSocket Synchronization Spec/i)
    ).toBeInTheDocument();
  });
});
