import { create } from 'zustand';
import type { ChatState, Conversation, Message } from '../types';

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: conversation?.messages || [] });
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setIsStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming });
  },
}));