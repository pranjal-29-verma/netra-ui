import React, { useEffect } from 'react';
import { ChatLayout } from '../components/chat/ChatLayout';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatArea } from '../components/chat/ChatArea';
import { useChatStore } from '../store/chatStore';
import type { Conversation } from '../types';

export const Dashboard: React.FC = () => {
  const { setConversations, setCurrentConversation } = useChatStore();

  useEffect(() => {
    // Load conversations from backend (will implement in next iteration)
    // For now, use mock data
    const mockConversations: Conversation[] = [
      {
        id: 1,
        userId: 1,
        title: 'Getting Started with React',
        isIncognito: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        userId: 1,
        title: 'Python Data Analysis Tips',
        isIncognito: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        userId: 1,
        title: 'Database Design Best Practices',
        isIncognito: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setConversations(mockConversations);

    // Optionally select first conversation
    // setCurrentConversation(mockConversations[0]);
  }, [setConversations, setCurrentConversation]);

  return (
    <ChatLayout sidebar={<ConversationList />}>
      <ChatArea />
    </ChatLayout>
  );
};