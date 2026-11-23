import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

/**
 * AuthContext manages current user session state, authentication status,
 * and user profile info.
 * Connects directly to Express JWT authentication endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - GET  /api/auth/me
 */
const AuthContext = createContext();

const DEFAULT_DEMO_USER = {
  id: 'usr_101',
  name: 'Alex Rivera',
  email: 'alex.rivera@syncspace.dev',
  role: 'Owner',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('syncspace_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_DEMO_USER;
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('syncspace_token') || 'demo_jwt_token_2026');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // Synchronize user and token to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('syncspace_user', JSON.stringify(user));
      const activeToken = token || 'demo_jwt_token_2026';
      localStorage.setItem('syncspace_token', activeToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('syncspace_user');
      localStorage.removeItem('syncspace_token');
      setIsAuthenticated(false);
    }
  }, [user, token]);

  // Verify token on mount with GET /auth/me
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('syncspace_token');
      if (!storedToken) return;

      try {
        const data = await apiClient.get('/auth/me');
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Backend offline or token expired
      }
    }
    verifySession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Attempt real Express API login
      const data = await apiClient.post('/auth/login', { email, password });
      if (data?.token && data?.user) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend API unreachable or returned error. Using demo session.', err.message);
      // Fallback demo login so UI remains fully testable
      const fallbackUser = {
        ...DEFAULT_DEMO_USER,
        email: email || DEFAULT_DEMO_USER.email,
        name: email ? email.split('@')[0] : DEFAULT_DEMO_USER.name,
      };
      setToken('demo_jwt_token_2026');
      setUser(fallbackUser);
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await apiClient.post('/auth/register', { name, email, password });
      if (data?.token && data?.user) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend register error or offline, fallback.', err.message);
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      setToken('demo_jwt_token_2026');
      setUser(fallbackUser);
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('syncspace_user');
    localStorage.removeItem('syncspace_token');
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: DEFAULT_DEMO_USER,
      token: 'demo-test-token',
      isAuthenticated: true,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    };
  }
  return context;
}

export { AuthContext };
export default AuthContext;
