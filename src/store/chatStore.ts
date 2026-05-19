import { create } from 'zustand';
import type { ChatState, Conversation, Message } from '../types';
import chatService from '../services/chatService';

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,

  setConversations: (conversations: Conversation[]) => set({ conversations }),

  setCurrentConversation: (conversation: Conversation | null) =>
    set({ currentConversation: conversation, messages: conversation?.messages || [] }),

  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages: Message[]) => set({ messages }),

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  setIsStreaming: (streaming: boolean) => set({ isStreaming: streaming }),

  fetchConversations: async () => {
    const conversations = await chatService.getConversations();
    set({ conversations });
  },

  createConversation: async () => {
    const conversation = await chatService.createConversation();
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation,
      messages: [],
    }));
    return conversation;
  },

  deleteConversation: async (id: number) => {
    await chatService.deleteConversation(id);
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== id);
      const currentConversation =
        state.currentConversation?.id === id ? null : state.currentConversation;
      return { conversations, currentConversation, messages: currentConversation ? state.messages : [] };
    });
  },

  fetchMessages: async (conversationId: number) => {
    set({ isLoading: true });
    try {
      const messages = await chatService.getMessages(conversationId);
      set({ messages });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId: number, content: string) => {
    set({ isLoading: true });
    try {
      const { user_message, assistant_message } = await chatService.sendMessage(conversationId, content);
      set((state) => ({ messages: [...state.messages, user_message, assistant_message] }));

      // Update conversation title if it was auto-set by the backend
      const updated = await chatService.getConversations();
      set({ conversations: updated });
    } finally {
      set({ isLoading: false });
    }
  },
}));