import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MailWarning, RefreshCw, X } from 'lucide-react';
import { ChatLayout } from '../components/chat/ChatLayout';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatArea } from '../components/chat/ChatArea';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

const UnverifiedBanner: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (!user || user.is_verified !== false || dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(user.email);
      toast.success('Verification email sent!');
    } catch {
      toast.error('Failed to resend. Try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 text-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <MailWarning className="w-4 h-4 flex-shrink-0" />
        <span>Please verify your email address to secure your account.</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Sending…' : 'Resend email'}
        </button>
        <button onClick={() => setDismissed(true)} className="text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const fetchConversations = useChatStore((state) => state.fetchConversations);

  useEffect(() => {
    fetchConversations().catch(() => toast.error('Failed to load conversations'));
  }, [fetchConversations]);

  return (
    <div className="flex flex-col h-screen">
      <UnverifiedBanner />
      <div className="flex-1 min-h-0">
        <ChatLayout sidebar={<ConversationList />}>
          <ChatArea />
        </ChatLayout>
      </div>
    </div>
  );
};