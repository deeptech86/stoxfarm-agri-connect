/**
 * React Query hooks for notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page?: number, unreadOnly?: boolean) => [...notificationKeys.all, 'list', page, unreadOnly] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// Hooks
export const useNotifications = (page = 1, pageSize = 20, unreadOnly = false) => {
  return useQuery({
    queryKey: notificationKeys.list(page, unreadOnly),
    queryFn: () => notificationService.getNotifications(page, pageSize, unreadOnly),
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getNotification(id),
    enabled: !!id,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Mutations
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
