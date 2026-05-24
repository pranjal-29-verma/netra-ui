import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Message } from './Message';
import { MessageSkeleton } from './MessageSkeleton';
import { ChatInput } from './ChatInput';
import { DocumentPanel } from './DocumentPanel';
import { useChatStore } from '../../store/chatStore';
import { useTokenUsage, TOKEN_USAGE_KEY } from '../../hooks/useTokenUsage';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${time}, ${name}!`;
}

export const ChatArea: React.FC = () => {
  const { currentConversation, messages, isLoading, isLoadingMessages, isStreaming, sendMessage, stopStreaming, createConversation, fetchMessages, isIncognito } = useChatStore();
  const { data: usage } = useTokenUsage();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [docPanelOpen, setDocPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isQuotaExhausted = usage ? usage.usage_percentage >= 100 : false;

  const handleSendMessage = async (content: string) => {
    if (isQuotaExhausted) return;
    try {
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const newConversation = await createConversation();
        conversationId = newConversation.id;
        await fetchMessages(conversationId);
      }
      await sendMessage(conversationId, content);
      qc.invalidateQueries({ queryKey: TOKEN_USAGE_KEY });
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('invalid')) {
        toast.error('AI model is misconfigured. Please contact the admin to fix the model settings.');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {docPanelOpen && <DocumentPanel onClose={() => setDocPanelOpen(false)} />}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Incognito banner */}
        {currentConversation?.is_incognito && (
          <div className="flex items-center justify-center gap-2 py-1.5 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800 text-xs text-purple-600 dark:text-purple-400">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Incognito — this conversation is not saved and will be lost on refresh</span>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            {!currentConversation ? (
              <div className="flex flex-col items-center justify-center h-full min-h-96 text-center px-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isIncognito ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                  {isIncognito
                    ? <EyeOff className="w-10 h-10 text-purple-500" />
                    : <MessageSquare className="w-10 h-10 text-primary-600" />
                  }
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {isIncognito ? 'Incognito Mode' : 'Welcome to Netra Chat'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isIncognito
                    ? 'Your messages will not be saved. Just type to start chatting.'
                    : 'Your personal knowledge assistant. Start a new conversation or select one from the sidebar.'
                  }
                </p>
                {!isIncognito && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                    <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">What I can help with:</h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <li>• Answer questions from your uploaded documents</li>
                      <li>• Search through your knowledge base</li>
                      <li>• Provide insights from your files and links</li>
                      <li>• Remember context across conversations</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : isLoadingMessages ? (
              <MessageSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-80 text-center px-4 py-12">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-5">
                  <Sparkles className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {getGreeting(user?.display_name || user?.username || 'there')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                  What's on your mind? Ask me anything or upload a document to get started.
                </p>
              </div>
            ) : (
              messages.map((message) => <Message key={message.id} message={message} />)
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          onOpenDocuments={() => setDocPanelOpen((o) => !o)}
          disabled={isLoading || isQuotaExhausted}
          isStreaming={isStreaming}
          onStopStreaming={stopStreaming}
        />
      </div>
    </div>
  );
};
