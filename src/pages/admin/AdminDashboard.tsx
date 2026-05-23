import React from 'react';
import { Users, MessageSquare, FileText, Zap, TrendingUp, UserPlus } from 'lucide-react';
import { useAdminStats, useAdminActivity } from '../../hooks/useAdminQueries';

function StatCard({ label, value, sub, icon, iconClass }: {
  label: string; value: number | string; sub?: string; icon: React.ReactNode; iconClass: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value === -1 ? '—' : value.toLocaleString()}
        </p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: activity, isLoading: loadingActivity } = useAdminActivity();

  const loading = loadingStats || loadingActivity;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform snapshot as of right now.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={loading ? '—' : stats!.users.total}
          sub={loading ? undefined : `${stats!.users.new_today} joined today`}
          icon={<Users className="w-5 h-5" />}
          iconClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Conversations"
          value={loading ? '—' : stats!.conversations.total}
          sub={loading ? undefined : `${stats!.conversations.today} started today`}
          icon={<MessageSquare className="w-5 h-5" />}
          iconClass="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Documents"
          value={loading ? '—' : stats!.documents.total}
          icon={<FileText className="w-5 h-5" />}
          iconClass="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Tokens Used Today"
          value={loading ? '—' : stats!.tokens.used_today}
          sub={loading ? undefined : `${stats!.tokens.total_ever.toLocaleString()} all time`}
          icon={<Zap className="w-5 h-5" />}
          iconClass="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <UserPlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Signups</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loadingActivity ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : activity!.recent_users.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No users yet.</p>
            ) : (
              activity!.recent_users.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.username}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(u.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent conversations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Conversations</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loadingActivity ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-600 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : activity!.recent_conversations.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No conversations yet.</p>
            ) : (
              activity!.recent_conversations.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">by {c.username}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
