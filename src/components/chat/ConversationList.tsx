import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Conversation } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { TokenUsageBar } from './TokenUsageBar';

export const ConversationList: React.FC = () => {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    createConversation,
    deleteConversation,
    fetchMessages,
    isLoading,
  } = useChatStore();

  const handleNewChat = async () => {
    try {
      await createConversation();
    } catch {
      toast.error('Failed to create conversation');
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    try {
      await fetchMessages(conversation.id);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const handleDeleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(conversationId);
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`group relative flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 mt-0.5 mr-3 flex-shrink-0 ${
                    currentConversation?.id === conversation.id
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      currentConversation?.id === conversation.id
                        ? 'text-primary-900'
                        : 'text-gray-900'
                    }`}
                  >
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(conversation.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Token Usage Bar */}
      <TokenUsageBar />

      {/* Incognito Toggle - Will implement in Iteration 11 */}
      <div className="p-4 border-t border-gray-200">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">Incognito Mode</span>
          <div className="relative">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Chats won't be saved in history
        </p>
      </div>
    </div>
  );
};