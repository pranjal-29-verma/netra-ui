import React, { useState } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, X, MessageSquare, FileText, Globe, EyeOff, ArrowUp, ArrowDown, ChevronsUpDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../types';
import {
  useAdminConversations, useDeleteAdminConversation,
  useAdminDocuments, useDeleteAdminDocument,
} from '../../hooks/useAdminQueries';

function formatBytes(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

type SortDir = 'asc' | 'desc';

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 group font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors select-none">
      {label}
      {active
        ? dir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-primary-500" /> : <ArrowDown className="w-3.5 h-3.5 text-primary-500" />
        : <ChevronsUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
      }
    </button>
  );
}

// ── Conversations Tab ──────────────────────────────────────────────────────────

type ConvSortKey = 'message_count' | 'created_at';

function ConversationsTab() {
  const { user: me } = useAuthStore();
  const canDelete = hasPermission(me, 'conversations:delete');

  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery]   = useState('');
  const [sortKey, setSortKey] = useState<ConvSortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data, isLoading } = useAdminConversations(page, query);
  const deleteConv = useDeleteAdminConversation();

  const toggleSort = (key: ConvSortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setQuery(search); };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this conversation permanently?')) return;
    deleteConv.mutate(id, {
      onSuccess: () => toast.success('Conversation deleted'),
      onError: () => toast.error('Failed to delete conversation'),
    });
  };

  const sorted = [...(data?.conversations ?? [])].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'message_count') return (a.message_count - b.message_count) * mul;
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mul;
  });

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or username…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">Search</button>
        {query && (
          <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3"><SortHeader label="Messages" active={sortKey === 'message_count'} dir={sortDir} onClick={() => toggleSort('message_count')} /></th>
                <th className="text-left px-4 py-3"><SortHeader label="Created" active={sortKey === 'created_at'} dir={sortDir} onClick={() => toggleSort('created_at')} /></th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(4)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>)}
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : data?.conversations.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No conversations found.</td></tr>
              ) : (
                sorted.map((c) => {
                  const isDeleting = deleteConv.isPending && deleteConv.variables === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {c.is_incognito ? <EyeOff className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" /> : <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-48">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.username}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.message_count}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{timeAgo(c.created_at)}</td>
                      <td className="px-4 py-3">
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={isDeleting}
                            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete conversation"
                          >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Page {data.page} of {data.pages} · {data.total} total</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Documents Tab ──────────────────────────────────────────────────────────────

type DocSortKey = 'file_size' | 'created_at';

function DocumentsTab() {
  const { user: me } = useAuthStore();
  const canDelete = hasPermission(me, 'documents:delete');

  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery]   = useState('');
  const [sortKey, setSortKey] = useState<DocSortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data, isLoading } = useAdminDocuments(page, query);
  const deleteDoc = useDeleteAdminDocument();

  const toggleSort = (key: DocSortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setQuery(search); };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this document permanently?')) return;
    deleteDoc.mutate(id, {
      onSuccess: () => toast.success('Document deleted'),
      onError: () => toast.error('Failed to delete document'),
    });
  };

  const sortedDocs = [...(data?.documents ?? [])].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'file_size') return ((a.file_size ?? 0) - (b.file_size ?? 0)) * mul;
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mul;
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      ready:      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      failed:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[s] ?? 'bg-gray-100 text-gray-500'}`}>{s}</span>;
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or username…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">Search</button>
        {query && (
          <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3">File</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3"><SortHeader label="Size" active={sortKey === 'file_size'} dir={sortDir} onClick={() => toggleSort('file_size')} /></th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3"><SortHeader label="Uploaded" active={sortKey === 'created_at'} dir={sortDir} onClick={() => toggleSort('created_at')} /></th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>)}
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : data?.documents.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No documents found.</td></tr>
              ) : (
                sortedDocs.map((d) => {
                  const isDeleting = deleteDoc.isPending && deleteDoc.variables === d.id;
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {d.source_url ? <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /> : <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-48">{d.filename}</p>
                            <p className="text-xs text-gray-400 uppercase">{d.file_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.username}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatBytes(d.file_size)}</td>
                      <td className="px-4 py-3">{statusBadge(d.status)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{timeAgo(d.created_at)}</td>
                      <td className="px-4 py-3">
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(d.id)}
                            disabled={isDeleting}
                            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete document"
                          >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Page {data.page} of {data.pages} · {data.total} total</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

type Tab = 'conversations' | 'documents';

export const AdminContent: React.FC = () => {
  const [tab, setTab] = useState<Tab>('conversations');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Content Oversight</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Conversation metadata and documents only — no message content is shown.
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-fit">
        {([
          { key: 'conversations', label: 'Conversations', icon: <MessageSquare className="w-4 h-4" /> },
          { key: 'documents',     label: 'Documents',     icon: <FileText className="w-4 h-4" /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'conversations' ? <ConversationsTab /> : <DocumentsTab />}
    </div>
  );
};
