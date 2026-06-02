import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Zap, Package, CheckCircle, Clock, Loader2 } from 'lucide-react';
import billingService, { type BillingSummary } from '../services/billingService';

export const Billing: React.FC = () => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingService.getSummary()
      .then(setSummary)
      .catch(() => toast.error('Failed to load billing info'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to chat
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing</h1>
        </div>

        {/* Current status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Current Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Plan</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {summary?.active_plan ? (
                  <span className="flex items-center gap-1.5 text-primary-600">
                    <Zap className="w-3.5 h-3.5" />
                    {summary.active_plan.name}
                  </span>
                ) : (
                  <span className="text-gray-500">Free Tier</span>
                )}
              </span>
            </div>
            {summary?.active_plan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Plan Expires</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(summary.active_plan.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Daily Quota</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {summary?.daily_quota.toLocaleString()} tokens/day
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Used Today</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {summary?.tokens_used_today.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Bonus Tokens</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                {summary?.bonus_tokens.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              {summary?.active_plan ? 'Renew or Upgrade' : 'Upgrade Plan'}
            </Link>
          </div>
        </div>

        {/* Purchase history */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Purchase History</h2>
          {!summary?.history.length ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.history.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.item_type === 'plan'
                      ? <Zap className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      : <Package className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.item_name}</p>
                      <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ₹{(item.amount_paid / 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5 justify-end">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
