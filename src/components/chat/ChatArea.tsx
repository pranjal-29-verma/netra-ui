import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../../store/chatStore';
import type { Message as MessageType } from '../../types';

export const ChatArea: React.FC = () => {
  const { currentConversation, messages, isStreaming, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!currentConversation) {
      // Will implement creating new conversation in backend iteration
      console.log('Need to create new conversation first');
      return;
    }

    // Add user message
    const userMessage: MessageType = {
      id: Date.now(),
      conversationId: currentConversation.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);

    // Simulate AI response (will be replaced with real API call)
    setTimeout(() => {
      const aiMessage: MessageType = {
        id: Date.now() + 1,
        conversationId: currentConversation.id,
        role: 'assistant',
        content: 'This is a placeholder response. Real AI integration will be added in Iteration 15.',
        tokensUsed: 150,
        createdAt: new Date().toISOString(),
      };
      addMessage(aiMessage);
    }, 1000);
  };

  const handleStopStreaming = () => {
    // Will implement in Iteration 15
    console.log('Stop streaming');
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

        {/* Input (disabled when no conversation) */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={true}
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
        isStreaming={isStreaming}
        onStopStreaming={handleStopStreaming}
      />
    </div>
  );
};