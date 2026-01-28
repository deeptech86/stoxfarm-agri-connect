/**
 * Notification Service
 */

import api from '@/lib/api';

export interface NotificationResponse {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export const notificationService = {
  /**
   * Get user notifications
   */
  getNotifications: async (
    page = 1,
    pageSize = 20,
    unreadOnly = false
  ): Promise<NotificationListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      unread_only: unreadOnly.toString(),
    });

    return api.get<NotificationListResponse>(`/notifications?${params}`);
  },

  /**
   * Get a single notification
   */
  getNotification: async (id: string): Promise<NotificationResponse> => {
    return api.get<NotificationResponse>(`/notifications/${id}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    return api.put<{ success: boolean }>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ marked_count: number }> => {
    return api.put<{ marked_count: number }>('/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>(`/notifications/${id}`);
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<{ deleted_count: number }> => {
    return api.delete<{ deleted_count: number }>('/notifications');
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    return api.get<{ unread_count: number }>('/notifications/unread-count');
  },
};

export default notificationService;
