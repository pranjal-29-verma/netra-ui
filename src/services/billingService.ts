import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Plan {
  id: number;
  name: string;
  description: string;
  price_inr: number;
  tokens_per_day: number;
  duration_days: number;
  max_documents: number | null;
  max_conversations: number | null;
}

export interface TokenPack {
  id: number;
  name: string;
  description: string;
  price_inr: number;
  bonus_tokens: number;
}

export interface BillingSummary {
  active_plan: {
    id: number;
    name: string;
    tokens_per_day: number;
    expires_at: string;
  } | null;
  daily_quota: number;
  tokens_used_today: number;
  bonus_tokens: number;
  welcome_bonus_claimed: boolean;
  history: {
    id: number;
    item_type: string;
    item_name: string;
    amount_paid: number;
    status: string;
    created_at: string;
    expires_at: string | null;
  }[];
}

const billingService = {
  async getPlans(): Promise<Plan[]> {
    const res = await api.get<Plan[]>(API_ENDPOINTS.BILLING_PLANS);
    return res.data;
  },

  async getPacks(): Promise<TokenPack[]> {
    const res = await api.get<TokenPack[]>(API_ENDPOINTS.BILLING_PACKS);
    return res.data;
  },

  async createOrder(itemType: 'plan' | 'pack', itemId: number) {
    const res = await api.post(API_ENDPOINTS.BILLING_CREATE_ORDER, {
      item_type: itemType,
      item_id: itemId,
    });
    return res.data as {
      order_id: string;
      amount: number;
      currency: string;
      key_id: string;
      item_name: string;
    };
  },

  async verifyPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const res = await api.post(API_ENDPOINTS.BILLING_VERIFY, params);
    return res.data;
  },

  async getSummary(): Promise<BillingSummary> {
    const res = await api.get<BillingSummary>(API_ENDPOINTS.BILLING_SUMMARY);
    return res.data;
  },
};

export default billingService;
