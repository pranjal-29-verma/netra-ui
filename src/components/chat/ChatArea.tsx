import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../../store/chatStore';

export const ChatArea: React.FC = () => {
  const { currentConversation, messages, isLoading, isStreaming, sendMessage, createConversation, fetchMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      let conversationId = currentConversation?.id;

      if (!conversationId) {
        const newConversation = await createConversation();
        conversationId = newConversation.id;
        await fetchMessages(conversationId);
      }

      await sendMessage(conversationId, content);
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleStopStreaming = () => {
    // Will implement in Iteration 15
  };

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-full">
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Netra Chat
            </h2>
            <p className="text-gray-600 mb-6">
              Your personal knowledge assistant. Start a new conversation or select one from the
              sidebar.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-blue-900 mb-2">What I can help with:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Answer questions from your uploaded documents</li>
                <li>• Search through your knowledge base</li>
                <li>• Provide insights from your files and links</li>
                <li>• Remember context across conversations</li>
              </ul>
            </div>
          </div>
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          isStreaming={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => <Message key={message.id} message={message} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        isStreaming={isStreaming}
        onStopStreaming={handleStopStreaming}
      />
    </div>
  );
};