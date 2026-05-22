import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';

export const AccountSettings: React.FC = () => {
  const { user } = useAuthStore();
  const isGoogleUser = !!(user as any)?.googleId || !(user as any)?.password_hash;

  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account credentials.</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email cannot be changed.</p>
      </div>

      {/* Password */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Change Password</h3>
        {isGoogleUser ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You signed in with Google. Password change is not available for Google-authenticated accounts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { name: 'current_password', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
              { name: 'new_password', label: 'New Password', show: showNew, toggle: () => setShowNew((v) => !v) },
              { name: 'confirm_password', label: 'Confirm New Password', show: showNew, toggle: () => setShowNew((v) => !v) },
            ].map((field) => (
              <div key={field.name} className="relative">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.show ? 'text' : 'password'}
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="mt-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
