import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Info, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  if (!user) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <div className="min-w-0 flex-shrink-0">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refreshNotifications}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 whitespace-nowrap"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="h-80">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-accent/80 transition-colors overflow-hidden ${
                  !notification.read ? 'bg-accent/50' : ''
                }`}
              >
                <div className="flex gap-2 overflow-hidden">
                  <div className="mt-0.5 flex-shrink-0">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {notification.title && (
                      <p className="text-sm font-medium truncate overflow-hidden">{notification.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-all overflow-hidden">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-shrink min-w-0">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-xs px-2 flex-shrink-0 whitespace-nowrap"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;
