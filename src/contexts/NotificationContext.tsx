import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import notificationService, { NotificationResponse } from '@/services/notification.service';
import fcmService, { FcmMessage } from '@/services/fcm.service';
import { getStoredTokens } from '@/lib/api';

interface Notification {
  id: string;
  userId: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (userId: string, message: string, type?: Notification['type']) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  getUnreadCount: (userId: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const transformNotification = (n: NotificationResponse): Notification => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  message: n.message,
  type: n.type,
  createdAt: new Date(n.created_at),
  read: n.is_read,
  data: n.data,
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastNotificationIdRef = useRef<string | null>(null);

  // Check if user is authenticated (has valid tokens)
  const isAuthenticated = !!user && !!getStoredTokens()?.access_token;

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationService.getNotifications(1, 50);
      const transformed = response.items.map(transformNotification);

      // Check for new notifications (show toast for new ones)
      if (lastNotificationIdRef.current && transformed.length > 0) {
        const newNotifications = transformed.filter(
          n => !n.read && new Date(n.createdAt) > new Date(lastNotificationIdRef.current || 0)
        );

        // Show toast for new unread notifications
        newNotifications.forEach(n => {
          toast({
            title: n.title || (n.type === 'success' ? 'Success' : n.type === 'warning' ? 'Warning' : n.type === 'error' ? 'Error' : 'Notification'),
            description: n.message,
            variant: n.type === 'error' || n.type === 'warning' ? 'destructive' : 'default',
          });
        });
      }

      // Update the last notification ID reference
      if (transformed.length > 0) {
        lastNotificationIdRef.current = transformed[0].id;
      }

      setNotifications(transformed);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Poll for new notifications every 30 seconds (fallback when FCM is not available)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  // Handle incoming FCM push notification (foreground)
  const handleFcmMessage = useCallback((message: FcmMessage) => {
    console.log('FCM foreground message received:', message);

    // Show toast for the push notification
    if (message.notification) {
      toast({
        title: message.notification.title || 'Notification',
        description: message.notification.body || '',
      });
    }

    // Refresh notifications to get the latest from backend
    fetchNotifications();
  }, [fetchNotifications]);

  // Initialize FCM when user logs in
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up FCM when user logs out
      fcmService.cleanupFcm().catch(console.error);
      return;
    }

    // Initialize FCM with foreground message handler (silently fall back to polling if not available)
    fcmService.initializeFcm(handleFcmMessage).then((fcmToken) => {
      if (fcmToken) {
        console.log('Push notifications enabled');
      }
      // If no token, polling is used automatically - no need to log
    }).catch(() => {
      // FCM init failed - polling fallback is used automatically
    });

    return () => {
      fcmService.cleanupFcm().catch(console.error);
    };
  }, [isAuthenticated, handleFcmMessage]);

  const addNotification = useCallback((userId: string, message: string, type: Notification['type'] = 'info') => {
    // This is for local notifications (e.g., client-side events)
    const notification: Notification = {
      id: `local-${Date.now()}`,
      userId,
      message,
      type,
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    toast({
      title: type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : type === 'error' ? 'Error' : 'Notification',
      description: message,
      variant: type === 'error' || type === 'warning' ? 'destructive' : 'default',
    });
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Skip API call for local notifications
    if (id.startsWith('local-')) return;

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, [notifications, unreadCount]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const getUnreadCount = useCallback((userId: string) => {
    if (user?.id === userId) {
      return unreadCount;
    }
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [user, unreadCount, notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      addNotification,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      getUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
