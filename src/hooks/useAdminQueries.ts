import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService, { type UsersPage, type ConversationsPage, type DocumentsPage } from '../services/adminService';

// ── Query keys ──────────────────────────────────────────────────────────────────

export const adminKeys = {
  stats:                 ['admin', 'stats'] as const,
  activity:              ['admin', 'activity'] as const,
  users:                 (page: number, query: string) => ['admin', 'users', page, query] as const,
  user:                  (id: number) => ['admin', 'user', id] as const,
  roles:                 ['admin', 'roles'] as const,
  permissions:           ['admin', 'permissions'] as const,
  conversations:         (page: number, query: string) => ['admin', 'conversations', page, query] as const,
  documents:             (page: number, query: string) => ['admin', 'documents', page, query] as const,
  registrationsTimeline: ['admin', 'analytics', 'registrations'] as const,
  conversationsTimeline: ['admin', 'analytics', 'conversations'] as const,
  topUsers:              ['admin', 'analytics', 'top-users'] as const,
};

// ── Dashboard ───────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: adminService.getStats,
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: adminKeys.activity,
    queryFn: adminService.getActivity,
  });
}

// ── Users ───────────────────────────────────────────────────────────────────────

export function useAdminUsers(page: number, query: string) {
  return useQuery({
    queryKey: adminKeys.users(page, query),
    queryFn: () => adminService.getUsers(page, 20, query),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(id: number | null) {
  return useQuery({
    queryKey: adminKeys.user(id!),
    queryFn: () => adminService.getUser(id!),
    enabled: id !== null,
  });
}

export function useToggleBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.toggleBan(id),
    onSuccess: (res, id) => {
      qc.setQueriesData<UsersPage>({ queryKey: ['admin', 'users'] }, (old) => {
        if (!old) return old;
        return { ...old, users: old.users.map((u) => u.id === id ? { ...u, is_active: res.is_active } : u) };
      });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: (_res, id) => {
      qc.setQueriesData<UsersPage>({ queryKey: ['admin', 'users'] }, (old) => {
        if (!old) return old;
        return { ...old, total: old.total - 1, users: old.users.filter((u) => u.id !== id) };
      });
    },
  });
}

export function useAssignRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      adminService.assignRoles(userId, roleIds),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: adminKeys.user(userId) });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// ── Roles ───────────────────────────────────────────────────────────────────────

export function useAdminRoles() {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: adminService.getRoles,
  });
}

export function useAdminPermissions(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.permissions,
    queryFn: adminService.getPermissions,
    enabled,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminService.createRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

// ── Content ─────────────────────────────────────────────────────────────────────

export function useAdminConversations(page: number, query: string) {
  return useQuery({
    queryKey: adminKeys.conversations(page, query),
    queryFn: () => adminService.getConversations(page, 20, query),
    placeholderData: (prev) => prev,
  });
}

export function useDeleteAdminConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteConversation(id),
    onSuccess: (_res, id) => {
      qc.setQueriesData<ConversationsPage>({ queryKey: ['admin', 'conversations'] }, (old) => {
        if (!old) return old;
        return { ...old, total: old.total - 1, conversations: old.conversations.filter((c) => c.id !== id) };
      });
    },
  });
}

export function useAdminDocuments(page: number, query: string) {
  return useQuery({
    queryKey: adminKeys.documents(page, query),
    queryFn: () => adminService.getDocuments(page, 20, query),
    placeholderData: (prev) => prev,
  });
}

export function useDeleteAdminDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteDocument(id),
    onSuccess: (_res, id) => {
      qc.setQueriesData<DocumentsPage>({ queryKey: ['admin', 'documents'] }, (old) => {
        if (!old) return old;
        return { ...old, total: old.total - 1, documents: old.documents.filter((d) => d.id !== id) };
      });
    },
  });
}

// ── Analytics ───────────────────────────────────────────────────────────────────

export function useRegistrationsTimeline() {
  return useQuery({
    queryKey: adminKeys.registrationsTimeline,
    queryFn: adminService.getRegistrationsTimeline,
    staleTime: 5 * 60_000,
  });
}

export function useConversationsTimeline() {
  return useQuery({
    queryKey: adminKeys.conversationsTimeline,
    queryFn: adminService.getConversationsTimeline,
    staleTime: 5 * 60_000,
  });
}

export function useTopUsers() {
  return useQuery({
    queryKey: adminKeys.topUsers,
    queryFn: adminService.getTopUsers,
    staleTime: 5 * 60_000,
  });
}
