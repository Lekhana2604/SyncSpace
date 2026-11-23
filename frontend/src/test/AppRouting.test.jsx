import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Routing and Layout', () => {
  it('renders application shell and dashboard by default', () => {
    render(<App />);

    // Brand logo
    expect(screen.getAllByText('SyncSpace')[0]).toBeInTheDocument();

    // Welcome hero message
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();

    // Nav elements
    expect(screen.getByText('Workspaces Directory')).toBeInTheDocument();
  });
});
