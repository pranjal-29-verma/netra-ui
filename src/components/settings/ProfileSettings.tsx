import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';
import { avatarUrl, nextRandomSeed, randomSeed } from '../../constants/avatars';

export const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.display_name || user?.displayName || '');
  const [gender, setGender] = useState(user?.gender || 'other');
  const [avatarSeed, setAvatarSeed] = useState(
    user?.avatar_seed || randomSeed(user?.gender),
  );
  const [saving, setSaving] = useState(false);

  const handleChangeAvatar = () => {
    setAvatarSeed((prev) => nextRandomSeed(prev, gender));
  };

  const handleGenderChange = (newGender: string) => {
    setGender(newGender);
    setAvatarSeed(randomSeed(newGender));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        display_name: displayName.trim() || undefined,
        gender,
        avatar_seed: avatarSeed,
      });
      updateUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your public profile and avatar.</p>
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Avatar</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            <img
              src={avatarUrl(avatarSeed, gender)}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleChangeAvatar}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Change Avatar
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Picks a new random avatar from your gender pool</p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={user?.username}
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This is the name shown in the chat.</p>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
        <div className="flex gap-3">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Prefer not to say' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleGenderChange(opt.value)}
              className={`flex-1 py-2 px-3 text-sm rounded-lg border-2 transition-colors ${
                gender === opt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Changing gender updates your avatar pool.</p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};
