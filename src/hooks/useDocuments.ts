import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentService from '../services/documentService';

export const documentsKey = (conversationId?: number) =>
  ['documents', conversationId ?? 'global'] as const;

export function useDocuments(conversationId?: number) {
  return useQuery({
    queryKey: documentsKey(conversationId),
    queryFn: () => documentService.getDocuments(conversationId),
  });
}

export function useUploadFile(conversationId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, scope }: { file: File; scope: 'global' | 'conversation' }) =>
      documentService.uploadFile(file, scope, conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKey(conversationId) });
    },
  });
}

export function useAddUrl(conversationId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ url, filename, scope }: { url: string; filename?: string; scope: 'global' | 'conversation' }) =>
      documentService.addUrl(url, filename, scope, conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKey(conversationId) });
    },
  });
}

export function useDeleteDocument(conversationId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => documentService.deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKey(conversationId) });
    },
  });
}
