import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { notificationsApi } from '../api/notifications';
import { onReceiveNotification, offReceiveNotification } from '../services/signalr';
import { useAuth } from './AuthContext';
import { NotificationType, type Notification as NotifType, type RealtimeNotification } from '../types';

/** Messages have their own Chat badge — exclude them from the bell icon */
const isNonMessageNotif = (n: NotifType) =>
  n.type !== NotificationType.Message && n.type !== ('Message' as any);

interface NotificationContextType {
  notifications: NotifType[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotifType[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsApi.getUnread();
      if (res.data.isSucceeded) {
        setNotifications((res.data.data || []).filter(isNonMessageNotif));
      }
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    refreshNotifications();

    const handler = (_notif: RealtimeNotification) => {
      refreshNotifications();
    };
    onReceiveNotification(handler);
    return () => offReceiveNotification(handler);
  }, [isAuthenticated, refreshNotifications]);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount: notifications.length, refreshNotifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
