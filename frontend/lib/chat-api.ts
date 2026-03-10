import { api } from "./api";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  sentAt: string;
  isRead: boolean;
  conversationId: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  unreadCount?: number;
}

export interface PaginatedMessages {
  data: Message[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

function unwrap<T>(r: { data?: T; Data?: T }): T | undefined {
  return r?.data ?? r?.Data;
}

export const chatApi = {
  getConversations: async () => {
    const r = await api.get<{ data?: Conversation[]; Data?: Conversation[] }>(
      "/api/Conversation"
    );
    const arr = unwrap(r);
    return Array.isArray(arr) ? arr : [];
  },

  getConversationWith: (userId: string) =>
    api.get<Conversation>(`/api/Conversation/with/${userId}`),

  createConversation: (userId: string) =>
    api.post<Conversation>(`/api/Conversation/with/${userId}`),

  deleteConversation: (conversationId: string) =>
    api.delete<void>(`/api/Conversation/${conversationId}`),

  getMessages: async (
    conversationId: string,
    pageNumber = 1,
    pageSize = 20
  ) => {
    const r = await api.get<
      | { data?: PaginatedMessages; Data?: PaginatedMessages }
      | PaginatedMessages
    >(
      `/api/Chat/conversations/${conversationId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
    const paginated = (r as { data?: PaginatedMessages })?.data ?? (r as PaginatedMessages)
    return paginated
  },

  sendMessage: (receiverId: string, messageText: string) =>
    api.post<{ data?: Message }>("/api/Chat/send-message", {
      receiverId,
      messageText,
    }),

  updateMessage: (messageId: string, messageText: string) =>
    api.put(`/api/Chat/messages/${messageId}`, { messageText }),

  deleteMessage: (messageId: string) =>
    api.delete(`/api/Chat/messages/${messageId}`),

  markAsRead: (conversationId: string) =>
    api.put(`/api/Chat/conversations/${conversationId}/mark-read`),

  getUnreadCount: (conversationId: string) =>
    api.get<{ data?: number }>(
      `/api/Chat/conversations/${conversationId}/unread-count`
    ).then((r) => (r as { data?: number })?.data ?? 0),
};
