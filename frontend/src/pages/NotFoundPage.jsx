import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-light-bg dark:bg-surface-dark-bg flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center mx-auto shadow-forest-md">
          <Layers className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-content-light-primary dark:text-content-dark-primary font-mono">
            404
          </h1>
          <h2 className="text-lg font-bold text-content-light-primary dark:text-content-dark-primary">
            Workspace Page Not Found
          </h2>
          <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
            The document, workspace, or resource you are trying to access does not exist or may have been relocated.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <NavLink to="/dashboard">
            <Button variant="primary" size="md" icon={Home}>
              Return to Dashboard
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
