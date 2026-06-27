import {
  getUnreadNotifications,
  markNotificationsRead,
} from "@/lib/api/notifications";

export type NotificationType = 1 | 2 | 3 | 4 | 5; // Like, ProfileVisit, Message, Match, Unlike

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getUnread: async () => {
    return getUnreadNotifications() as Promise<Notification[]>;
  },

  markAllRead: () => markNotificationsRead(),
};
