import React, { useEffect, useRef } from 'react';
import { MessageSquare, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../../store/chatStore';
import { useTokenStore } from '../../store/tokenStore';

export const ChatArea: React.FC = () => {
  const { currentConversation, messages, isLoading, isStreaming, sendMessage, createConversation, fetchMessages, isIncognito } = useChatStore();
  const { usage, fetchUsage } = useTokenStore();
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
      fetchUsage().catch(() => {});
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleStopStreaming = () => {
    // Will implement in Iteration 15
  };

  return (
    <div className="flex flex-col h-full">

      {/* Incognito banner — shown only when inside an incognito conversation */}
      {currentConversation?.is_incognito && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-purple-50 border-b border-purple-100 text-xs text-purple-600">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Incognito — this conversation is not saved and will be lost on refresh</span>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!currentConversation ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full min-h-96 text-center px-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isIncognito ? 'bg-purple-100' : 'bg-primary-100'}`}>
                {isIncognito
                  ? <EyeOff className="w-10 h-10 text-purple-500" />
                  : <MessageSquare className="w-10 h-10 text-primary-600" />
                }
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isIncognito ? 'Incognito Mode' : 'Welcome to Netra Chat'}
              </h2>
              <p className="text-gray-600 mb-6">
                {isIncognito
                  ? 'Your messages will not be saved. Just type to start chatting.'
                  : 'Your personal knowledge assistant. Start a new conversation or select one from the sidebar.'
                }
              </p>
              {!isIncognito && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-blue-900 mb-2">What I can help with:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Answer questions from your uploaded documents</li>
                    <li>• Search through your knowledge base</li>
                    <li>• Provide insights from your files and links</li>
                    <li>• Remember context across conversations</li>
                  </ul>
                </div>
              )}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => <Message key={message.id} message={message} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input — always rendered at the same tree position, preventing remount on state change */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || isQuotaExhausted}
        isStreaming={isStreaming}
        onStopStreaming={handleStopStreaming}
      />
    </div>
  );
};
