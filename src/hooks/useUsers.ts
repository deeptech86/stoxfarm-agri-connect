/**
 * React Query hooks for user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, CreateUserRequest, UpdateUserRequest } from '@/services/user.service';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  list: (page?: number, role?: string, includeInactive?: boolean) =>
    [...userKeys.all, 'list', page, role, includeInactive] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  search: (query: string, role?: string) => [...userKeys.all, 'search', query, role] as const,
  byRole: (role: string, page?: number) => [...userKeys.all, 'role', role, page] as const,
};

// Hooks
export const useUsers = (page = 1, pageSize = 20, role?: string, includeInactive = false) => {
  return useQuery({
    queryKey: userKeys.list(page, role, includeInactive),
    queryFn: () => userService.getUsers(page, pageSize, role, includeInactive),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

export const useSearchUsers = (query: string, role?: string, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: userKeys.search(query, role),
    queryFn: () => userService.searchUsers(query, role, page, pageSize),
    enabled: query.length > 0,
  });
};

export const useUsersByRole = (role: string, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: userKeys.byRole(role, page),
    queryFn: () => userService.getUsersByRole(role, page, pageSize),
  });
};

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hard = false }: { id: string; hard?: boolean }) =>
      userService.deleteUser(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
