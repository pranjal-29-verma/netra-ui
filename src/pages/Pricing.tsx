import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Package, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import billingService, { type Plan, type TokenPack } from '../services/billingService';
import { useRazorpay } from '../hooks/useRazorpay';
import { useAuthStore } from '../store/authStore';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { pay } = useRazorpay();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([billingService.getPlans(), billingService.getPacks()])
      .then(([p, pk]) => { setPlans(p); setPacks(pk); })
      .catch(() => toast.error('Failed to load pricing'))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (itemType: 'plan' | 'pack', itemId: number, _label: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPaying(`${itemType}-${itemId}`);
    await pay(itemType, itemId, () => navigate('/billing'));
    setPaying(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to chat
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Plans & Top-ups</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Start free · Upgrade anytime · No auto-renewal
          </p>
        </div>

        {/* Free tier callout */}
        <div className="mb-10 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Free tier — always available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              500 tokens/day · 500 welcome bonus tokens on signup · Renews daily at midnight UTC
            </p>
          </div>
        </div>

        {/* Plans */}
        {plans.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Daily Plans</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">{plan.description}</p>
                  <div className="mt-4 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <p>✦ {plan.tokens_per_day.toLocaleString()} tokens/day</p>
                    <p>✦ {plan.duration_days} days duration</p>
                    <p>✦ {plan.max_documents ? `${plan.max_documents} documents` : 'Unlimited documents'}</p>
                    <p>✦ {plan.max_conversations ? `${plan.max_conversations} conversations` : 'Unlimited conversations'}</p>
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{plan.price_inr}</span>
                    <button
                      onClick={() => handlePay('plan', plan.id, plan.name)}
                      disabled={!!paying}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {paying === `plan-${plan.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Buy Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Token packs */}
        {packs.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Token Top-ups</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">Never expire · Consumed after daily quota</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map((pack) => (
                <div key={pack.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{pack.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">{pack.description}</p>
                  <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                    <p>✦ {pack.bonus_tokens.toLocaleString()} bonus tokens</p>
                    <p className="text-xs text-gray-400 mt-1">Tokens never reset or expire</p>
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{pack.price_inr}</span>
                    <button
                      onClick={() => handlePay('pack', pack.id, pack.name)}
                      disabled={!!paying}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {paying === `pack-${pack.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Buy Pack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
