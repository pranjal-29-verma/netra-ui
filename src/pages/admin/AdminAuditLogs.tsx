import React, { useState } from 'react';
import { ClipboardList, Loader2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useAuditLogs, type AuditLogParams } from '../../hooks/useAdminQueries';

// ── Action badge colours ──────────────────────────────────────────────────────

const ACTION_COLOURS: Record<string, string> = {
  // User
  'user.ban':                 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'user.unban':               'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'user.delete':              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'user.quota_change':        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  // Roles
  'role.assign':              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'role.create':              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  // LLM
  'llm.toggle':               'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'llm.config.create':        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'llm.config.activate':      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'llm.config.deactivate':    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  'llm.config.delete':        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // Content
  'conversation.delete':      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'document.delete':          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  // Billing — Plans
  'billing.plan_create':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'billing.plan_update':      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'billing.plan_activate':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'billing.plan_deactivate':  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  // Billing — Token Packs
  'billing.pack_create':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'billing.pack_update':      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'billing.pack_activate':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'billing.pack_deactivate':  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  // Announcements
  'announcement.send':        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const ACTION_LABELS: Record<string, string> = {
  // User
  'user.ban':                 'User Deactivated',
  'user.unban':               'User Activated',
  'user.delete':              'User Deleted',
  'user.quota_change':        'Quota Changed',
  // Roles
  'role.assign':              'Roles Assigned',
  'role.create':              'Role Created',
  // LLM
  'llm.toggle':               'LLM Source Toggled',
  'llm.config.create':        'Model Config Added',
  'llm.config.activate':      'Model Activated',
  'llm.config.deactivate':    'Model Deactivated',
  'llm.config.delete':        'Model Config Deleted',
  // Content
  'conversation.delete':      'Conversation Deleted',
  'document.delete':          'Document Deleted',
  // Billing — Plans
  'billing.plan_create':      'Plan Created',
  'billing.plan_update':      'Plan Updated',
  'billing.plan_activate':    'Plan Activated',
  'billing.plan_deactivate':  'Plan Deactivated',
  // Billing — Token Packs
  'billing.pack_create':      'Pack Created',
  'billing.pack_update':      'Pack Updated',
  'billing.pack_activate':    'Pack Activated',
  'billing.pack_deactivate':  'Pack Deactivated',
  // Announcements
  'announcement.send':        'Announcement Sent',
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function MetadataBadge({ data }: { data: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
      {JSON.stringify(data)}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export const AdminAuditLogs: React.FC = () => {
  const [page, setPage]           = useState(1);
  const [action, setAction]       = useState('');
  const [actor, setActor]         = useState('');
  const [targetType, setTargetType] = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [actorInput, setActorInput] = useState('');

  const params: AuditLogParams = {
    page, limit: 20,
    action:      action      || undefined,
    actor:       actor       || undefined,
    target_type: targetType  || undefined,
    date_from:   dateFrom    || undefined,
    date_to:     dateTo      || undefined,
  };

  const { data, isLoading } = useAuditLogs(params);

  const clearFilters = () => {
    setAction(''); setActor(''); setActorInput('');
    setTargetType(''); setDateFrom(''); setDateTo('');
    setPage(1);
  };

  const hasFilters = action || actor || targetType || dateFrom || dateTo;

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Audit Logs
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Full trail of admin actions — who did what and when.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Action type */}
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All actions</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_LABELS[a]}</option>
            ))}
          </select>

          {/* Target type */}
          <select
            value={targetType}
            onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All targets</option>
            <option value="user">User</option>
            <option value="role">Role</option>
            <option value="llm_config">LLM Config</option>
            <option value="conversation">Conversation</option>
            <option value="document">Document</option>
            <option value="plan">Billing — Plan</option>
            <option value="token_pack">Billing — Token Pack</option>
            <option value="system">System</option>
          </select>

          {/* Actor search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by actor…"
              value={actorInput}
              onChange={(e) => setActorInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setActor(actorInput); setPage(1); } }}
              className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl pl-3 pr-8 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 w-44"
            />
            <button
              onClick={() => { setActor(actorInput); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="self-center text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {data && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {data.total} {data.total === 1 ? 'entry' : 'entries'} found
          </p>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {data?.logs.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-16">
              No audit entries found.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data?.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {log.actor_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLOURS[log.action] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {log.target_label ? (
                        <span>{log.target_label}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      <MetadataBadge data={log.metadata} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {data.page} of {data.pages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
