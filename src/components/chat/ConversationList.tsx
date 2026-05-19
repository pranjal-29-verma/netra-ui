import React from 'react';
import { Plus, MessageSquare, Trash2, EyeOff } from 'lucide-react';
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
    isIncognito,
    toggleIncognito,
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
      {/* Incognito active indicator */}
      {isIncognito && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 border-b border-purple-100">
          <EyeOff className="w-3 h-3 text-purple-500" />
          <span className="text-xs text-purple-600 font-medium">Incognito — chats not saved</span>
        </div>
      )}

      {/* New Chat Button — hidden in incognito (user types to auto-create) */}
      {!isIncognito && (
        <div className="p-4">
          <button
            onClick={handleNewChat}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">
              {isIncognito ? 'Type a message to start' : 'Start a new chat to begin'}
            </p>
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
                {conversation.is_incognito
                  ? <EyeOff className="w-4 h-4 mt-0.5 mr-3 flex-shrink-0 text-purple-400" />
                  : <MessageSquare className={`w-4 h-4 mt-0.5 mr-3 flex-shrink-0 ${
                      currentConversation?.id === conversation.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    currentConversation?.id === conversation.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {conversation.is_incognito ? 'Not saved' : formatDate(conversation.updated_at)}
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

      {/* Incognito Toggle */}
      <div className="p-4 border-t border-gray-200">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <EyeOff className={`w-4 h-4 ${isIncognito ? 'text-purple-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700">Incognito Mode</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isIncognito}
              onChange={toggleIncognito}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          {isIncognito ? 'Chats are session-only and never saved' : "Chats won't be saved in history"}
        </p>
      </div>
    </div>
  );
};
