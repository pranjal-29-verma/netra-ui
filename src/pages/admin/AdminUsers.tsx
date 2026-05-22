import React, { useEffect, useState, useCallback } from 'react';
import { Search, Ban, Trash2, ChevronLeft, ChevronRight, X, ShieldOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService, { type AdminUser, type UsersPage } from '../../services/adminService';
import { avatarUrl } from '../../constants/avatars';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../types';

function UserDetailModal({ user, onClose, onBan, onDelete }: {
  user: AdminUser;
  onClose: () => void;
  onBan: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const { user: me } = useAuthStore();
  const canBan = hasPermission(me, 'users:ban');
  const canDelete = hasPermission(me, 'users:delete');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">User Detail</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 dark:bg-primary-900">
              {user.avatar_seed ? (
                <img src={avatarUrl(user.avatar_seed, user.gender)} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-lg font-medium text-primary-700 dark:text-primary-300">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{user.display_name || user.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${
              user.is_active
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {user.is_active ? 'Active' : 'Banned'}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Conversations', value: user.conversations },
              { label: 'Messages', value: user.messages ?? '—' },
              { label: 'Documents', value: user.documents ?? '—' },
              { label: 'Tokens (today)', value: (user.tokens_used_today ?? 0).toLocaleString() },
              { label: 'Tokens (total)', value: (user.total_tokens_used ?? 0).toLocaleString() },
              { label: 'Joined', value: new Date(user.created_at).toLocaleDateString() },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Roles */}
          <div className="flex flex-wrap gap-1.5">
            {user.roles.length === 0 ? (
              <span className="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full border border-violet-200 dark:border-violet-800 italic">
                just vibing
              </span>
            ) : user.roles.map((r) => (
              <span key={r} className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full border border-primary-200 dark:border-primary-800">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-0">
          {canBan && (
            <button
              onClick={() => { onBan(user.id); onClose(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                user.is_active
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
              }`}
            >
              {user.is_active ? <><Ban className="w-4 h-4" /> Ban</> : <><Shield className="w-4 h-4" /> Unban</>}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => { onDelete(user.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const AdminUsers: React.FC = () => {
  const { user: me } = useAuthStore();
  const canBan    = hasPermission(me, 'users:ban');
  const canDelete = hasPermission(me, 'users:delete');

  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [query, setQuery]     = useState('');
  const [data, setData]       = useState<UsersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(page, 20, query);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const u = await adminService.getUser(id);
      setSelected(u);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBan = async (id: number) => {
    try {
      const res = await adminService.toggleBan(id);
      toast.success(res.is_active ? 'User unbanned' : 'User banned');
      setData((prev) =>
        prev ? {
          ...prev,
          users: prev.users.map((u) => u.id === id ? { ...u, is_active: res.is_active } : u),
        } : prev,
      );
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted');
      setData((prev) =>
        prev ? { ...prev, total: prev.total - 1, users: prev.users.filter((u) => u.id !== id) } : prev,
      );
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data ? `${data.total} total` : '—'}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or email…"
              className="pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            Search
          </button>
          {query && (
            <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Roles</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Chats</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-1.5">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                          <div className="h-2.5 bg-gray-100 dark:bg-gray-600 rounded w-32" />
                        </div>
                      </div>
                    </td>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-4 py-3 align-middle">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      </td>
                    ))}
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                data?.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(u.id)} className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 dark:bg-primary-900">
                          {u.avatar_seed ? (
                            <img src={avatarUrl(u.avatar_seed, u.gender)} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-300">
                              {u.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400">
                            {u.display_name || u.username}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full border border-violet-200 dark:border-violet-800 italic">
                            just vibing
                          </span>
                        ) : u.roles.map((r) => (
                          <span key={r} className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full border border-primary-200 dark:border-primary-800">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.conversations}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {canBan && (
                          <button
                            onClick={() => handleBan(u.id)}
                            title={u.is_active ? 'Ban user' : 'Unban user'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active
                                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            {u.is_active ? <Ban className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            title="Delete user"
                            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {data.page} of {data.pages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onBan={handleBan}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
