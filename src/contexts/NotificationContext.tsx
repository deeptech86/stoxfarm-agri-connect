import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (userId: string, message: string, type?: Notification['type']) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: (userId: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((userId: string, message: string, type: Notification['type'] = 'info') => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      message,
      type,
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [notification, ...prev]);
    
    toast({
      title: type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : type === 'error' ? 'Error' : 'Notification',
      description: message,
      variant: type === 'error' || type === 'warning' ? 'destructive' : 'default',
    });
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getUnreadCount = (userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, getUnreadCount }}>
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
