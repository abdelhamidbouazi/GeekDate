import {
  getAllNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationsRead,
  markOneNotificationRead,
  deleteNotification,
} from "@/lib/api/notifications"

export type NotificationType = 1 | 2 | 3 | 4 | 5

export interface Notification {
  id: string
  userId: string
  fromUserId: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export const notificationApi = {
  getAll: () => getAllNotifications() as Promise<Notification[]>,
  getUnread: () => getUnreadNotifications() as Promise<Notification[]>,
  getUnreadCount: () => getUnreadCount(),
  markAllRead: () => markNotificationsRead(),
  markOneRead: (id: string) => markOneNotificationRead(id),
  delete: (id: string) => deleteNotification(id),
}
