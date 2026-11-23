import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import WorkspacesPage from './pages/WorkspacesPage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import DocumentEditorPage from './pages/DocumentEditorPage';
import TeamPage from './pages/TeamPage';
import CommentsActivityPage from './pages/CommentsActivityPage';
import VersionHistorySettingsPage from './pages/VersionHistorySettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import ReactConceptsPage from './pages/ReactConceptsPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * ProtectedRoute component: verifies authentication state.
 * If user is not authenticated, redirects to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/invite/:token" element={<AcceptInvitePage />} />

              {/* Protected Routes enclosed within AppLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="workspaces" element={<WorkspacesPage />} />
                <Route path="workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
                <Route
                  path="workspaces/:workspaceId/documents/:documentId"
                  element={<DocumentEditorPage />}
                />
                <Route path="shared" element={<WorkspacesPage />} />
                <Route path="favorites" element={<WorkspacesPage />} />
                <Route path="activity" element={<CommentsActivityPage />} />
                <Route path="notifications" element={<CommentsActivityPage />} />
                <Route path="team/:workspaceId" element={<TeamPage />} />
                <Route path="comments" element={<CommentsActivityPage />} />
                <Route path="settings" element={<VersionHistorySettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="react-concepts" element={<ReactConceptsPage />} />
              </Route>

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
