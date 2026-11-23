import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await register(name, email, password);
      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light-bg dark:bg-surface-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-forest-700 text-white items-center justify-center shadow-forest-md mb-2">
            <Layers className="w-6 h-6 text-forest-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-light-primary dark:text-content-dark-primary">
            Create your SyncSpace Account
          </h1>
          <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
            Join team workspaces and edit rich documents in real time
          </p>
        </div>

        <div className="p-8 bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 shadow-forest-lg space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
              icon={ArrowRight}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="pt-4 border-t border-forest-50 dark:border-forest-900/40 text-center text-xs text-content-light-secondary">
            Already have an account?{' '}
            <NavLink to="/login" className="text-forest-700 dark:text-forest-400 font-semibold hover:underline">
              Sign In
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
