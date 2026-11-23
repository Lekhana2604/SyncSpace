import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.rivera@syncspace.dev');
    setPassword('DemoPass123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-surface-light-bg dark:bg-surface-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-forest-700 text-white items-center justify-center shadow-forest-md mb-2">
            <Layers className="w-6 h-6 text-forest-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-light-primary dark:text-content-dark-primary">
            Sign In to SyncSpace
          </h1>
          <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
            Access your collaborative team workspace and synchronized documents
          </p>
        </div>

        {/* Card */}
        <div className="p-8 bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 shadow-forest-lg space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="alex.rivera@syncspace.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-content-light-secondary">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-forest-600 focus:ring-forest-500"
                />
                Remember this device
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-forest-600 dark:text-forest-400 hover:underline font-medium"
              >
                Use Demo Login
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
              icon={ArrowRight}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t border-forest-50 dark:border-forest-900/40 text-center text-xs text-content-light-secondary">
            Don't have an account yet?{' '}
            <NavLink to="/register" className="text-forest-700 dark:text-forest-400 font-semibold hover:underline">
              Create an account
            </NavLink>
          </div>
        </div>

        <div className="text-center text-[11px] text-content-light-muted">
          Academic Project for React.js Course • Forest Theme
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
