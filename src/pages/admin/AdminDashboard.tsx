import React from 'react';
import { Users, MessageSquare, FileText, Zap } from 'lucide-react';

const placeholderCards = [
  { label: 'Total Users',         icon: <Users className="w-5 h-5" />,         color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { label: 'Conversations',       icon: <MessageSquare className="w-5 h-5" />, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  { label: 'Documents',           icon: <FileText className="w-5 h-5" />,      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  { label: 'Tokens Used Today',   icon: <Zap className="w-5 h-5" />,           color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome to the Netra admin panel.</p>
      </div>

      {/* Stat cards — populated in P5.3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {placeholderCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">—</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon notice */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6 text-center">
        <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
          Dashboard stats coming in P5.3
        </p>
        <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
          Use the sidebar to navigate to Users, Roles, Content, and Analytics.
        </p>
      </div>
    </div>
  );
};
