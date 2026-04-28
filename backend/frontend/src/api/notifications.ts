import api from './client';
import type { ApiResponse, Notification } from '../types';

export const notificationsApi = {
  // WRAPPED — returns Response<IReadOnlyCollection<Notification>>
  getUnread: () =>
    api.get<ApiResponse<Notification[]>>('/notification/unread'),

  markAllRead: () =>
    api.put('/notification/mark-read'),
};
