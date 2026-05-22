import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Palette, Shield } from 'lucide-react';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { AccountSettings } from '../components/settings/AccountSettings';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';

type Tab = 'profile' | 'account' | 'appearance' | 'privacy';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'account', label: 'Account', icon: <Lock className="w-4 h-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
];

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'account': return <AccountSettings />;
      case 'appearance': return <AppearanceSettings />;
      case 'privacy': return <PrivacySettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Back to chat"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="lg:w-52 flex-shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => (
              <li key={tab.id} className="flex-shrink-0">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
