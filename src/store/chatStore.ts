import { create } from 'zustand';
import type { ChatState, Conversation, Message } from '../types';
import chatService from '../services/chatService';

const buildLocalConversation = (): Conversation => ({
  id: -Date.now(),           // negative ID = never persisted to DB
  user_id: 0,
  title: 'Incognito Chat',
  is_incognito: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const buildLocalMessage = (conversationId: number, role: 'user' | 'assistant', content: string): Message => ({
  id: -Date.now() - Math.random(),
  conversation_id: conversationId,
  role,
  content,
  created_at: new Date().toISOString(),
});

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  isIncognito: false,

  setConversations: (conversations: Conversation[]) => set({ conversations }),

  setCurrentConversation: (conversation: Conversation | null) =>
    set({ currentConversation: conversation, messages: conversation?.messages || [] }),

  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages: Message[]) => set({ messages }),

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  setIsStreaming: (streaming: boolean) => set({ isStreaming: streaming }),

  toggleIncognito: () => {
    const { isIncognito, conversations } = get();
    if (!isIncognito) {
      // Turning ON — clear any existing selection, keep only real conversations in list
      set({ isIncognito: true, currentConversation: null, messages: [] });
    } else {
      // Turning OFF — drop all in-memory incognito conversations from the list
      set({
        isIncognito: false,
        currentConversation: null,
        messages: [],
        conversations: conversations.filter((c) => !c.is_incognito),
      });
    }
  },

  fetchConversations: async () => {
    const conversations = await chatService.getConversations();
    // Preserve any in-memory incognito conversations already in state
    const { conversations: current } = get();
    const incognito = current.filter((c) => c.is_incognito);
    set({ conversations: [...incognito, ...conversations] });
  },

  createConversation: async () => {
    const { isIncognito } = get();

    if (isIncognito) {
      const conversation = buildLocalConversation();
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
      }));
      return conversation;
    }

    const conversation = await chatService.createConversation();
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation,
      messages: [],
    }));
    return conversation;
  },

  deleteConversation: async (id: number) => {
    // Negative ID = incognito, remove from state only
    if (id < 0) {
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
        messages: state.currentConversation?.id === id ? [] : state.messages,
      }));
      return;
    }

    await chatService.deleteConversation(id);
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== id);
      const currentConversation =
        state.currentConversation?.id === id ? null : state.currentConversation;
      return { conversations, currentConversation, messages: currentConversation ? state.messages : [] };
    });
  },

  fetchMessages: async (conversationId: number) => {
    // Negative ID = incognito — messages already live in state, nothing to fetch
    if (conversationId < 0) return;

    set({ isLoading: true });
    try {
      const messages = await chatService.getMessages(conversationId);
      set({ messages });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId: number, content: string) => {
    // Negative ID = incognito — handle entirely in memory, no API call
    if (conversationId < 0) {
      const userMsg = buildLocalMessage(conversationId, 'user', content);
      const botMsg = buildLocalMessage(
        conversationId,
        'assistant',
        `*(Incognito)* I received: "${content}"\n\nThis conversation is not saved anywhere.`,
      );
      set((state) => ({ messages: [...state.messages, userMsg, botMsg] }));
      return;
    }

    set({ isLoading: true });
    try {
      const { user_message, assistant_message } = await chatService.sendMessage(conversationId, content);
      set((state) => ({ messages: [...state.messages, user_message, assistant_message] }));

      const updated = await chatService.getConversations();
      const { conversations: current } = get();
      const incognito = current.filter((c) => c.is_incognito);
      set({ conversations: [...incognito, ...updated] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
