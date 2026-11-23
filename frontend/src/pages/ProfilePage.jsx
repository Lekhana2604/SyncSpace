import React, { useState } from 'react';
import { User, Mail, Shield, Key, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email] = useState(user?.email || 'alex.rivera@syncspace.dev');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name });
    setSuccessMsg('Profile updated successfully');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2.5">
          <User className="w-6 h-6 text-forest-700 dark:text-forest-400" />
          User Profile
        </h1>
        <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1">
          Manage your personal account details, display name, and security preferences
        </p>
      </div>

      <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 shadow-forest-sm space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-forest-50 dark:border-forest-900/40">
          <Avatar name={user?.name} src={user?.avatar} size="xl" status="online" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-content-light-primary dark:text-content-dark-primary">
                {user?.name}
              </h2>
              <Badge variant="owner">Owner</Badge>
            </div>
            <p className="text-xs text-content-light-secondary mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-content-light-muted mt-1">
              Active Member of 4 Workspaces • Verified
            </p>
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address (Login Identifier)"
            value={email}
            disabled
            helperText="Email cannot be modified directly in the demo workspace."
          />

          <div className="flex items-center justify-between pt-4 border-t border-forest-50 dark:border-forest-900/40">
            {successMsg ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </span>
            ) : <div />}

            <Button type="submit" variant="primary" icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Password Section */}
      <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-2xl border border-forest-100 dark:border-forest-900/60 shadow-forest-sm space-y-4">
        <h3 className="text-sm font-bold text-content-light-primary dark:text-content-dark-primary flex items-center gap-2">
          <Key className="w-4 h-4 text-forest-700 dark:text-forest-400" />
          Account Security
        </h3>
        <p className="text-xs text-content-light-secondary">
          Passwords in SyncSpace are hashed with bcrypt and secured with JSON Web Tokens (JWT).
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="sm">
            Change Password
          </Button>
          <Button variant="ghost" size="sm">
            View Active Login Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
