import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { Users, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import adminService, { type DailyCount, type TopUser, type AdminStats } from '../../services/adminService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// Fill gaps so the chart always shows 30 contiguous days
function fillDays(rows: DailyCount[], days = 30): DailyCount[] {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const result: DailyCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface ChartCardProps { title: string; data: DailyCount[]; color: string; loading: boolean; }

function ChartCard({ title, data, color, loading }: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }}
              tickLine={false}
              axisLine={false}
              interval={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgb(31,41,55)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'rgb(243,244,246)',
              }}
              labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function TopUsersCard({ data, loading }: { data: TopUser[]; loading: boolean }) {
  const max = data[0]?.total_tokens ?? 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Token Consumers</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-5 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No token usage data yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((u, i) => (
            <div key={u.username} className="flex items-center gap-3 group">
              <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.username}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {formatTokens(u.total_tokens)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-500"
                    style={{ width: `${(u.total_tokens / max) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
                +{formatTokens(u.today_tokens)} today
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats]           = useState<AdminStats | null>(null);
  const [regData, setRegData]       = useState<DailyCount[]>([]);
  const [convData, setConvData]     = useState<DailyCount[]>([]);
  const [topUsers, setTopUsers]     = useState<TopUser[]>([]);
  const [loadingStats, setLoadingStats]   = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTop, setLoadingTop]       = useState(true);

  useEffect(() => {
    adminService.getStats().then(setStats).finally(() => setLoadingStats(false));

    Promise.all([
      adminService.getRegistrationsTimeline(),
      adminService.getConversationsTimeline(),
    ]).then(([reg, conv]) => {
      setRegData(fillDays(reg));
      setConvData(fillDays(conv));
    }).finally(() => setLoadingCharts(false));

    adminService.getTopUsers().then(setTopUsers).finally(() => setLoadingTop(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Usage trends and token consumption — last 30 days.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Total Tokens Ever"
          value={loadingStats ? '—' : formatTokens(stats?.tokens.total_ever ?? 0)}
          sub={`${formatTokens(stats?.tokens.used_today ?? 0)} used today`}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Active Users"
          value={loadingStats ? '—' : String(stats?.users.active ?? 0)}
          sub={`${stats?.users.new_today ?? 0} joined today`}
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Total Conversations"
          value={loadingStats ? '—' : formatTokens(stats?.conversations.total ?? 0)}
          sub={`${stats?.conversations.today ?? 0} today`}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Messages"
          value={loadingStats ? '—' : formatTokens(stats?.messages.total ?? 0)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="New User Registrations (30d)"
          data={regData}
          color="#0ea5e9"
          loading={loadingCharts}
        />
        <ChartCard
          title="New Conversations (30d)"
          data={convData}
          color="#8b5cf6"
          loading={loadingCharts}
        />
      </div>

      {/* Top consumers */}
      <TopUsersCard data={topUsers} loading={loadingTop} />
    </div>
  );
};
