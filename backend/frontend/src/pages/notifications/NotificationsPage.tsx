import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, Eye, MessageCircle, Users, HeartOff, Check } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationType, type Notification } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Message notifications are handled by the Chat badge — only show social notifications here
const notifConfig: Record<string | number, { icon: typeof Heart; color: string; label: string }> = {
  [NotificationType.Like]: { icon: Heart, color: 'text-primary', label: 'liked your profile' },
  [NotificationType.ProfileVisit]: { icon: Eye, color: 'text-blue-500', label: 'viewed your profile' },
  [NotificationType.Match]: { icon: Users, color: 'text-purple-500', label: 'matched with you!' },
  [NotificationType.Unlike]: { icon: HeartOff, color: 'text-gray-500', label: 'unliked your profile' },
  // String keys (if backend serializes enums as strings)
  'Like': { icon: Heart, color: 'text-primary', label: 'liked your profile' },
  'ProfileVisit': { icon: Eye, color: 'text-blue-500', label: 'viewed your profile' },
  'Match': { icon: Users, color: 'text-purple-500', label: 'matched with you!' },
  'Unlike': { icon: HeartOff, color: 'text-gray-500', label: 'unliked your profile' },
};

/** Types that belong in the notification bell — messages are in Chat */
const isNonMessageNotif = (n: Notification) =>
  n.type !== NotificationType.Message && n.type !== ('Message' as any);

export default function NotificationsPage() {
  const { markAllRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getUnread().then(res => {
      if (res.data.isSucceeded) {
        // Filter out message notifications — those live in the Chat section
        setNotifications((res.data.data || []).filter(isNonMessageNotif));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications([]);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" /> Notifications
        </h1>
        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition cursor-pointer border-none">
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-text-light">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No new notifications</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-border overflow-hidden">
          {notifications.map(notif => {
            const config = notifConfig[notif.type] || notifConfig[NotificationType.Like];
            const Icon = config.icon;
            return (
              <Link key={notif.id} to={`/user/${notif.fromUserId}`} className="no-underline">
                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  <div className={`p-2 rounded-full bg-gray-100 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text">
                      <span className="font-medium">Someone</span> {config.label}
                    </p>
                    <p className="text-xs text-text-light mt-0.5">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
