import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Power, Zap, Package, CreditCard, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

interface Plan {
  id: number;
  name: string;
  description: string;
  price_inr: number;
  tokens_per_day: number;
  duration_days: number;
  max_documents: number | null;
  max_conversations: number | null;
  is_active: boolean;
}

interface TokenPack {
  id: number;
  name: string;
  description: string;
  price_inr: number;
  bonus_tokens: number;
  is_active: boolean;
}

interface Subscription {
  id: number;
  username: string;
  email: string;
  item_type: string;
  item_name: string;
  amount_paid: number;
  status: string;
  created_at: string;
  expires_at: string | null;
}

const emptyPlan = { name: '', description: '', price_inr: 20, tokens_per_day: 10000, duration_days: 30, max_documents: null as number | null, max_conversations: null as number | null };
const emptyPack = { name: '', description: '', price_inr: 20, bonus_tokens: 5000 };

export const AdminBilling: React.FC = () => {
  const [tab, setTab] = useState<'plans' | 'packs' | 'subscriptions'>('plans');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan modal
  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [planSaving, setPlanSaving] = useState(false);

  // Pack modal
  const [packModal, setPackModal] = useState(false);
  const [editingPack, setEditingPack] = useState<TokenPack | null>(null);
  const [packForm, setPackForm] = useState(emptyPack);
  const [packSaving, setPackSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, pk, s] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN_BILLING_PLANS),
        api.get(API_ENDPOINTS.ADMIN_BILLING_PACKS),
        api.get(API_ENDPOINTS.ADMIN_BILLING_SUBSCRIPTIONS),
      ]);
      setPlans(p.data);
      setPacks(pk.data);
      setSubs(s.data.subscriptions);
    } catch {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Plans ──────────────────────────────────────────────────────────────────
  const openCreatePlan = () => { setEditingPlan(null); setPlanForm(emptyPlan); setPlanModal(true); };
  const openEditPlan = (p: Plan) => { setEditingPlan(p); setPlanForm({ name: p.name, description: p.description, price_inr: p.price_inr, tokens_per_day: p.tokens_per_day, duration_days: p.duration_days, max_documents: p.max_documents, max_conversations: p.max_conversations }); setPlanModal(true); };

  const savePlan = async () => {
    setPlanSaving(true);
    try {
      if (editingPlan) {
        await api.patch(API_ENDPOINTS.ADMIN_BILLING_PLAN(editingPlan.id), planForm);
        toast.success('Plan updated');
      } else {
        await api.post(API_ENDPOINTS.ADMIN_BILLING_PLANS, planForm);
        toast.success('Plan created');
      }
      setPlanModal(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save plan');
    } finally {
      setPlanSaving(false);
    }
  };

  const togglePlan = async (id: number) => {
    await api.patch(API_ENDPOINTS.ADMIN_BILLING_PLAN_TOGGLE(id));
    fetchAll();
  };

  // ── Packs ──────────────────────────────────────────────────────────────────
  const openCreatePack = () => { setEditingPack(null); setPackForm(emptyPack); setPackModal(true); };
  const openEditPack = (p: TokenPack) => { setEditingPack(p); setPackForm({ name: p.name, description: p.description, price_inr: p.price_inr, bonus_tokens: p.bonus_tokens }); setPackModal(true); };

  const savePack = async () => {
    setPackSaving(true);
    try {
      if (editingPack) {
        await api.patch(API_ENDPOINTS.ADMIN_BILLING_PACK(editingPack.id), packForm);
        toast.success('Pack updated');
      } else {
        await api.post(API_ENDPOINTS.ADMIN_BILLING_PACKS, packForm);
        toast.success('Pack created');
      }
      setPackModal(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save pack');
    } finally {
      setPackSaving(false);
    }
  };

  const togglePack = async (id: number) => {
    await api.patch(API_ENDPOINTS.ADMIN_BILLING_PACK_TOGGLE(id));
    fetchAll();
  };

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';
  const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Billing Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['plans', 'packs', 'subscriptions'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            {t === 'plans' && <Zap className="w-3.5 h-3.5 inline mr-1.5" />}
            {t === 'packs' && <Package className="w-3.5 h-3.5 inline mr-1.5" />}
            {t === 'subscriptions' && <CreditCard className="w-3.5 h-3.5 inline mr-1.5" />}
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : (
        <>
          {/* ── Plans Tab ── */}
          {tab === 'plans' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={openCreatePlan} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> New Plan
                </button>
              </div>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{plan.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{plan.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>₹{plan.price_inr}</span>
                        <span>·</span>
                        <span>{plan.tokens_per_day.toLocaleString()} tokens/day</span>
                        <span>·</span>
                        <span>{plan.duration_days} days</span>
                        <span>·</span>
                        <span>{plan.max_documents ?? '∞'} docs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditPlan(plan)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => togglePlan(plan.id)} className={`p-2 rounded-lg transition-colors ${plan.is_active ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500'}`} title={plan.is_active ? 'Disable' : 'Enable'}><Power className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {!plans.length && <p className="text-sm text-gray-400 text-center py-10">No plans yet. Create one.</p>}
              </div>
            </div>
          )}

          {/* ── Packs Tab ── */}
          {tab === 'packs' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={openCreatePack} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> New Pack
                </button>
              </div>
              <div className="space-y-3">
                {packs.map((pack) => (
                  <div key={pack.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{pack.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pack.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {pack.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pack.description}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>₹{pack.price_inr}</span>
                        <span>·</span>
                        <span>{pack.bonus_tokens.toLocaleString()} bonus tokens</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditPack(pack)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => togglePack(pack.id)} className={`p-2 rounded-lg transition-colors ${pack.is_active ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500'}`} title={pack.is_active ? 'Disable' : 'Enable'}><Power className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {!packs.length && <p className="text-sm text-gray-400 text-center py-10">No packs yet. Create one.</p>}
              </div>
            </div>
          )}

          {/* ── Subscriptions Tab ── */}
          {tab === 'subscriptions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Item</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {subs.map((s) => (
                    <tr key={s.id} className="text-gray-700 dark:text-gray-300">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{s.username}</div>
                        <div className="text-xs text-gray-400">{s.email}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1">
                          {s.item_type === 'plan' ? <Zap className="w-3.5 h-3.5 text-primary-500" /> : <Package className="w-3.5 h-3.5 text-amber-500" />}
                          {s.item_name}
                        </span>
                      </td>
                      <td className="py-3 pr-4">₹{(s.amount_paid / 100).toFixed(0)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-gray-500">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {!subs.length && (
                    <tr><td colSpan={6} className="py-10 text-center text-gray-400">No subscriptions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Plan Modal ── */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{editingPlan ? 'Edit Plan' : 'New Plan'}</h2>
              <button onClick={() => setPlanModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className={labelCls}>Name</label><input className={inputCls} value={planForm.name} onChange={e => setPlanForm(f => ({...f, name: e.target.value}))} /></div>
              <div><label className={labelCls}>Description</label><input className={inputCls} value={planForm.description} onChange={e => setPlanForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Price (₹)</label><input type="number" className={inputCls} value={planForm.price_inr} onChange={e => setPlanForm(f => ({...f, price_inr: +e.target.value}))} /></div>
                <div><label className={labelCls}>Duration (days)</label><input type="number" className={inputCls} value={planForm.duration_days} onChange={e => setPlanForm(f => ({...f, duration_days: +e.target.value}))} /></div>
              </div>
              <div><label className={labelCls}>Tokens/day</label><input type="number" className={inputCls} value={planForm.tokens_per_day} onChange={e => setPlanForm(f => ({...f, tokens_per_day: +e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Max Documents (blank=∞)</label><input type="number" className={inputCls} value={planForm.max_documents ?? ''} onChange={e => setPlanForm(f => ({...f, max_documents: e.target.value ? +e.target.value : null}))} /></div>
                <div><label className={labelCls}>Max Conversations (blank=∞)</label><input type="number" className={inputCls} value={planForm.max_conversations ?? ''} onChange={e => setPlanForm(f => ({...f, max_conversations: e.target.value ? +e.target.value : null}))} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setPlanModal(false)} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={savePlan} disabled={planSaving} className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                {planSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pack Modal ── */}
      {packModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{editingPack ? 'Edit Pack' : 'New Token Pack'}</h2>
              <button onClick={() => setPackModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className={labelCls}>Name</label><input className={inputCls} value={packForm.name} onChange={e => setPackForm(f => ({...f, name: e.target.value}))} /></div>
              <div><label className={labelCls}>Description</label><input className={inputCls} value={packForm.description} onChange={e => setPackForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Price (₹)</label><input type="number" className={inputCls} value={packForm.price_inr} onChange={e => setPackForm(f => ({...f, price_inr: +e.target.value}))} /></div>
                <div><label className={labelCls}>Bonus Tokens</label><input type="number" className={inputCls} value={packForm.bonus_tokens} onChange={e => setPackForm(f => ({...f, bonus_tokens: +e.target.value}))} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setPackModal(false)} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={savePack} disabled={packSaving} className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                {packSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
