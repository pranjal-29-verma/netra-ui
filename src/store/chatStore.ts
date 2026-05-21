import { create } from 'zustand';
import type { ChatState, Conversation, Message } from '../types';
import chatService from '../services/chatService';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { useAuthStore } from './authStore';

let streamAbortController: AbortController | null = null;

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
  isLoadingMessages: false,
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

    set({ isLoadingMessages: true, messages: [] });
    try {
      const messages = await chatService.getMessages(conversationId);
      set({ messages });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId: number, content: string) => {
    // Negative ID = incognito — real LLM, but nothing is saved to DB
    if (conversationId < 0) {
      const tempAssistantId = -Date.now() - 1;
      const now = new Date().toISOString();
      const userMsg = buildLocalMessage(conversationId, 'user', content);

      // Build history from current messages for multi-turn context
      const history = get().messages.map((m) => ({ role: m.role, content: m.content }));

      set((state) => ({
        messages: [
          ...state.messages,
          userMsg,
          { id: tempAssistantId, conversation_id: conversationId, role: 'assistant' as const, content: '', created_at: now, isStreaming: true },
        ],
        isStreaming: true,
      }));

      streamAbortController = new AbortController();

      try {
        const token = useAuthStore.getState().token;
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.CHAT_STREAM}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content, history }),
            signal: streamAbortController.signal,
          },
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = JSON.parse(line.slice(6));

            if (data.type === 'delta') {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempAssistantId ? { ...m, content: m.content + data.content } : m,
                ),
              }));
            } else if (data.type === 'error') {
              set((state) => ({
                messages: state.messages.filter((m) => m.id !== tempAssistantId),
              }));
              throw new Error(data.message || 'LLM error');
            } else if (data.type === 'done') {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, isStreaming: false, sources: data.sources || [] }
                    : m,
                ),
              }));
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          set((state) => ({
            messages: state.messages.filter((m) => m.id !== tempAssistantId),
          }));
          throw err;
        }
      } finally {
        set({ isStreaming: false });
        streamAbortController = null;
      }
      return;
    }

    set({ isLoading: true, isStreaming: true });

    // Add optimistic user message and empty streaming assistant placeholder
    const tempUserId = -Date.now();
    const tempAssistantId = -Date.now() - 1;
    const now = new Date().toISOString();
    set((state) => ({
      messages: [
        ...state.messages,
        { id: tempUserId, conversation_id: conversationId, role: 'user', content, created_at: now },
        { id: tempAssistantId, conversation_id: conversationId, role: 'assistant', content: '', created_at: now, isStreaming: true },
      ],
    }));

    streamAbortController = new AbortController();

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MESSAGES_STREAM(conversationId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content }),
          signal: streamAbortController.signal,
        },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let realUserMsgId = tempUserId;
      let realAssistantMsgId = tempAssistantId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'user_message') {
            realUserMsgId = data.message.id;
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === tempUserId ? { ...m, id: realUserMsgId } : m,
              ),
            }));
          } else if (data.type === 'delta') {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === tempAssistantId || m.id === realAssistantMsgId
                  ? { ...m, content: m.content + data.content }
                  : m,
              ),
            }));
          } else if (data.type === 'error') {
            // LLM error mid-stream — drop assistant placeholder, keep saved user message
            set((state) => ({
              messages: state.messages
                .filter((m) => m.id !== tempAssistantId)
                .map((m) => (m.id === tempUserId ? { ...m, id: realUserMsgId } : m)),
            }));
            throw new Error(data.message || 'LLM error');
          } else if (data.type === 'done') {
            realAssistantMsgId = data.message.id;
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === tempAssistantId
                  ? { ...data.message, isStreaming: false }
                  : m,
              ),
            }));

            // Refresh conversation list to get updated title/timestamp
            const updated = await chatService.getConversations();
            const { conversations: current } = get();
            const incognito = current.filter((c) => c.is_incognito);
            set({ conversations: [...incognito, ...updated] });
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        // Remove placeholder messages on error
        set((state) => ({
          messages: state.messages.filter(
            (m) => m.id !== tempUserId && m.id !== tempAssistantId,
          ),
        }));
        throw err;
      }
    } finally {
      set({ isLoading: false, isStreaming: false });
      streamAbortController = null;
    }
  },

  stopStreaming: () => {
    streamAbortController?.abort();
    streamAbortController = null;
    // Mark any streaming message as no longer streaming
    set((state) => ({
      isStreaming: false,
      messages: state.messages.map((m) => ({ ...m, isStreaming: false })),
    }));
  },
}));
