import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Conversation, Message } from '../types';

interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
}

const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS);
    return response.data;
  },

  async createConversation(title = 'New Chat', isIncognito = false): Promise<Conversation> {
    const response = await api.post<Conversation>(API_ENDPOINTS.CONVERSATIONS, {
      title,
      is_incognito: isIncognito,
    });
    return response.data;
  },

  async deleteConversation(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CONVERSATION(id));
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(API_ENDPOINTS.MESSAGES(conversationId));
    return response.data;
  },

  async sendMessage(conversationId: number, content: string): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>(API_ENDPOINTS.MESSAGES(conversationId), { content });
    return response.data;
  },
};

export default chatService;
