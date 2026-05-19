import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChatLayout } from '../components/chat/ChatLayout';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatArea } from '../components/chat/ChatArea';
import { useChatStore } from '../store/chatStore';

export const Dashboard: React.FC = () => {
  const fetchConversations = useChatStore((state) => state.fetchConversations);

  useEffect(() => {
    fetchConversations().catch(() => toast.error('Failed to load conversations'));
  }, [fetchConversations]);

  return (
    <ChatLayout sidebar={<ConversationList />}>
      <ChatArea />
    </ChatLayout>
  );
};