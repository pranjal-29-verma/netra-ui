import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';

export const PrivacySettings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [saveConversations, setSaveConversations] = useState(
    user?.save_conversations !== false,
  );
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    const next = !saveConversations;
    setSaveConversations(next);
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ save_conversations: next });
      updateUser(updated);
      toast.success(next ? 'Conversations will be saved' : 'Conversations will not be saved');
    } catch {
      setSaveConversations(!next);
      toast.error('Failed to update privacy setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Privacy</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Control how your data is handled.</p>
      </div>

      <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Save conversations</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              When turned off, all new chats behave like incognito mode — messages are not saved to history and are lost on refresh.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={saveConversations}
          onClick={handleToggle}
          disabled={saving}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 ${
            saveConversations ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${saveConversations ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
};
