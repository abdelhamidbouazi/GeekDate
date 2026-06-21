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

function unwrap<T>(r: { data?: T; Data?: T }): T | undefined {
  return r?.data ?? r?.Data;
}

function unwrapEnvelope(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = raw as Record<string, unknown>;
  if ("data" in r && r.data !== undefined) return r.data;
  if ("Data" in r && r.Data !== undefined) return r.Data;
  return raw;
}

/**
 * GET /api/Chat/conversations/{id}/messages returns either:
 * - Response&lt;ConversationMessagesResponseDto&gt;: { data: { messages: { data: [...] }, isBlocked } }
 * - Response&lt;PaginatedResult&lt;Message&gt;&gt;: { data: { data: [...] } }
 */
export function parseConversationMessagesJson(raw: unknown): {
  messages: Message[];
  isBlocked: boolean;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
} {
  const defaults = { messages: [] as Message[], isBlocked: false, totalCount: 0, pageNumber: 1, pageSize: 20 };
  const inner = unwrapEnvelope(raw);
  if (!inner || typeof inner !== "object") return defaults;

  const o = inner as Record<string, unknown>;
  const messagesWrapper = (o.messages ?? o.Messages) as Record<string, unknown> | undefined;
  if (messagesWrapper && typeof messagesWrapper === "object") {
    const pageData = messagesWrapper.data ?? messagesWrapper.Data;
    return {
      messages: Array.isArray(pageData) ? (pageData as Message[]) : [],
      isBlocked: Boolean(o.isBlocked ?? o.IsBlocked),
      totalCount: Number(messagesWrapper.totalCount ?? messagesWrapper.TotalCount ?? 0),
      pageNumber: Number(messagesWrapper.pageNumber ?? messagesWrapper.PageNumber ?? 1),
      pageSize: Number(messagesWrapper.pageSize ?? messagesWrapper.PageSize ?? 20),
    };
  }
  const directData = (o.data ?? o.Data) as unknown;
  return {
    messages: Array.isArray(directData) ? (directData as Message[]) : [],
    isBlocked: Boolean(o.isBlocked ?? o.IsBlocked),
    totalCount: Number(o.totalCount ?? o.TotalCount ?? 0),
    pageNumber: Number(o.pageNumber ?? o.PageNumber ?? 1),
    pageSize: Number(o.pageSize ?? o.PageSize ?? 20),
  };
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
    api.post<Conversation>(`/api/Conversation/with/${userId}`, {}),

  deleteConversation: (conversationId: string) =>
    api.delete<void>(`/api/Conversation/${conversationId}`),

  getMessages: async (conversationId: string, pageNumber = 1, pageSize = 20) => {
    const raw = await api.get<unknown>(
      `/api/Chat/conversations/${conversationId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return parseConversationMessagesJson(raw);
  },

  sendMessage: async (receiverId: string, messageText: string) => {
    const r = await api.post<{ data?: Message; Data?: Message }>("/api/Chat/send-message", {
      receiverId,
      messageText,
    });
    return unwrap(r);
  },

  updateMessage: (messageId: string, messageText: string) =>
    api.put(`/api/Chat/messages/${messageId}`, { messageText }),

  deleteMessage: (messageId: string) =>
    api.delete(`/api/Chat/messages/${messageId}`),

  markAsRead: (conversationId: string) =>
    api.put(`/api/Chat/conversations/${conversationId}/mark-read`, {}),

  getUnreadCount: async (conversationId: string) => {
    const r = await api.get<{ data?: number; Data?: number }>(
      `/api/Chat/conversations/${conversationId}/unread-count`
    );
    return unwrap(r) ?? 0;
  },
};
