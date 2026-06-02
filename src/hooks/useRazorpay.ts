import { useCallback } from 'react';
import toast from 'react-hot-toast';
import billingService from '../services/billingService';
import { useAuthStore } from '../store/authStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function useRazorpay() {
  const user = useAuthStore((state) => state.user);

  const pay = useCallback(
    async (
      itemType: 'plan' | 'pack',
      itemId: number,
      onSuccess: () => void,
    ) => {
      const loaded = await loadScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        return;
      }

      let order: Awaited<ReturnType<typeof billingService.createOrder>>;
      try {
        order = await billingService.createOrder(itemType, itemId);
      } catch (err: any) {
        toast.error(err?.message || 'Could not create order. Please try again.');
        return;
      }

      const options = {
        key: order.key_id,   // returned by backend — no frontend env var needed
        amount: order.amount,
        currency: order.currency,
        name: 'Netra',
        description: order.item_name,
        order_id: order.order_id,
        prefill: {
          email: user?.email ?? '',
          name: user?.display_name || user?.username || '',
        },
        theme: { color: '#4F46E5' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await billingService.verifyPayment(response);
            toast.success(`Payment successful! ${order.item_name} activated.`);
            onSuccess();
          } catch {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
          }
        },
        modal: {
          ondismiss: () => toast('Payment cancelled.', { icon: 'ℹ️' }),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res: any) => {
        toast.error(`Payment failed: ${res.error?.description || 'Unknown error'}`);
      });
      rzp.open();
    },
    [user],
  );

  return { pay };
}
