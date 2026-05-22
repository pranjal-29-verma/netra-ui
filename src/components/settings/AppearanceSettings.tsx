import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, applyTheme } from '../../store/themeStore';
import type { Theme } from '../../store/themeStore';

const THEMES: { value: Theme; icon: React.ReactNode; label: string; description: string }[] = [
  { value: 'light', icon: <Sun className="w-5 h-5" />, label: 'Light', description: 'Always use light theme' },
  { value: 'system', icon: <Monitor className="w-5 h-5" />, label: 'System', description: 'Follow your OS preference' },
  { value: 'dark', icon: <Moon className="w-5 h-5" />, label: 'Dark', description: 'Always use dark theme' },
];

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const handleTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize how Netra Chat looks.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTheme(t.value)}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-colors ${
                theme === t.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {t.icon}
              <span className="text-sm font-medium">{t.label}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 text-center leading-tight">{t.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
