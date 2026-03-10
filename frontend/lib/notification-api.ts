import { api } from "./api";

export type NotificationType = 1 | 2 | 3 | 4 | 5; // Like, ProfileVisit, Message, Match, Unlike

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

function unwrap<T>(r: { data?: T; Data?: T }): T | undefined {
  return r?.data ?? r?.Data;
}

export const notificationApi = {
  getUnread: async () => {
    const r = await api.get<{ data?: Notification[]; Data?: Notification[] }>(
      "/api/Notification/unread"
    );
    const arr = unwrap(r);
    return Array.isArray(arr) ? arr : [];
  },

  markAllRead: () => api.put("/api/Notification/mark-read"),
};
