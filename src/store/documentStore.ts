import { create } from 'zustand';
import type { DocumentState } from '../types';
import documentService from '../services/documentService';

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isUploading: false,

  fetchDocuments: async (conversationId?: number) => {
    const documents = await documentService.getDocuments(conversationId);
    set({ documents });
  },

  uploadFile: async (file: File, scope: 'global' | 'conversation' = 'global', conversationId?: number) => {
    set({ isUploading: true });
    try {
      const doc = await documentService.uploadFile(file, scope, conversationId);
      set((state) => ({ documents: [doc, ...state.documents] }));
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? '';
      if (err?.response?.status === 403 && detail.includes('Document limit')) {
        throw new Error(detail);
      }
      throw err;
    } finally {
      set({ isUploading: false });
    }
  },

  addUrl: async (url: string, filename?: string, scope: 'global' | 'conversation' = 'global', conversationId?: number) => {
    set({ isUploading: true });
    try {
      const doc = await documentService.addUrl(url, filename, scope, conversationId);
      set((state) => ({ documents: [doc, ...state.documents] }));
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? '';
      if (err?.response?.status === 403 && detail.includes('Document limit')) {
        throw new Error(detail);
      }
      throw err;
    } finally {
      set({ isUploading: false });
    }
  },

  deleteDocument: async (id: number) => {
    await documentService.deleteDocument(id);
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
  },
}));
