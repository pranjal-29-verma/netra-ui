import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, Trash2, EyeOff, Search, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Conversation } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { TokenUsageBar } from './TokenUsageBar';
import { ConversationSkeleton } from './ConversationSkeleton';

const HighlightedTitle: React.FC<{ title: string; query: string }> = ({ title, query }) => {
  if (!query.trim()) return <span>{title}</span>;

  const idx = title.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{title}</span>;

  return (
    <span>
      {title.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded-sm px-0.5">
        {title.slice(idx, idx + query.length)}
      </mark>
      {title.slice(idx + query.length)}
    </span>
  );
};

export const ConversationList: React.FC = () => {
  const {
    conversations, currentConversation, setCurrentConversation,
    createConversation, deleteConversation, fetchMessages,
    isLoading, isLoadingConversations, isLoadingMore, hasMoreConversations,
    loadMoreConversations, isIncognito, toggleIncognito,
  } = useChatStore();

  const [query, setQuery] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — triggers loadMore when sentinel scrolls into view
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreConversations(); },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMoreConversations]);

  const filteredConversations = query.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()),
      )
    : conversations;

  const handleNewChat = async () => {
    try { await createConversation(); }
    catch { toast.error('Failed to create conversation'); }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    if (currentConversation?.id === conversation.id) return;
    setCurrentConversation(conversation);
    try { await fetchMessages(conversation.id); }
    catch { toast.error('Failed to load messages'); }
  };

  const handleDeleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await deleteConversation(conversationId); }
    catch { toast.error('Failed to delete conversation'); }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Incognito indicator */}
      {isIncognito && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
          <EyeOff className="w-3 h-3 text-purple-500" />
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Incognito — chats not saved</span>
        </div>
      )}

      {/* New Chat Button */}
      {!isIncognito && (
        <div className="p-4 pb-2">
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

      {/* Search Input */}
      {!isIncognito && !isLoadingConversations && conversations.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus-within:border-primary-400 focus-within:bg-white dark:focus-within:bg-gray-800 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 text-xs bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {query && (
              <button onClick={() => setQuery('')} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoadingConversations ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {isIncognito ? 'Type a message to start' : 'Start a new chat to begin'}
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No results for</p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5 truncate max-w-full px-2">"{query}"</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`group relative flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                {conversation.is_incognito
                  ? <EyeOff className="w-4 h-4 mt-0.5 mr-3 flex-shrink-0 text-purple-400" />
                  : <MessageSquare className={`w-4 h-4 mt-0.5 mr-3 flex-shrink-0 ${
                      currentConversation?.id === conversation.id ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    currentConversation?.id === conversation.id
                      ? 'text-primary-900 dark:text-primary-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    <HighlightedTitle title={conversation.title} query={query} />
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {conversation.is_incognito ? 'Not saved' : formatDate(conversation.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}

            {/* Sentinel for IntersectionObserver — only shown when not searching */}
            {!query && (
              <div ref={sentinelRef} className="py-2 flex justify-center">
                {isLoadingMore && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Usage Bar */}
      <TokenUsageBar />

      {/* Incognito Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <EyeOff className={`w-4 h-4 ${isIncognito ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Incognito Mode</span>
          </div>
          <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={isIncognito} onChange={toggleIncognito} />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
          </div>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {isIncognito ? 'Chats are session-only and never saved' : "Chats won't be saved in history"}
        </p>
      </div>
    </div>
  );
};
