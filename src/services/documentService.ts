import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Document } from '../types';

const documentService = {
  async getDocuments(conversationId?: number): Promise<Document[]> {
    const params = conversationId ? { conversation_id: conversationId } : {};
    const response = await api.get<Document[]>(API_ENDPOINTS.DOCUMENTS, { params });
    return response.data;
  },

  async uploadFile(
    file: File,
    scope: 'global' | 'conversation' = 'global',
    conversationId?: number,
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', scope);
    if (scope === 'conversation' && conversationId) {
      formData.append('conversation_id', String(conversationId));
    }
    const response = await api.post<Document>(API_ENDPOINTS.DOCUMENT_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async addUrl(
    url: string,
    filename?: string,
    scope: 'global' | 'conversation' = 'global',
    conversationId?: number,
  ): Promise<Document> {
    const response = await api.post<Document>(API_ENDPOINTS.DOCUMENT_URL, {
      url,
      filename,
      scope,
      conversation_id: scope === 'conversation' ? conversationId : undefined,
    });
    return response.data;
  },

  async deleteDocument(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.DOCUMENT(id));
  },
};

export default documentService;
