import { api } from "./api";
import { endpoints } from "@/lib/api/endpoints";
import {
  createConversation,
  deleteConversation,
  getConversationWith,
  getConversations,
} from "@/lib/api/conversations";

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

function normalizeMessage(raw: unknown): Message | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = item.id ?? item.Id;
  const senderId = item.senderId ?? item.SenderId;
  const receiverId = item.receiverId ?? item.ReceiverId;
  const conversationId = item.conversationId ?? item.ConversationId;
  if (!id || !senderId || !receiverId || !conversationId) return null;
  return {
    id: String(id),
    senderId: String(senderId),
    receiverId: String(receiverId),
    messageText: String(item.messageText ?? item.MessageText ?? ""),
    sentAt: String(item.sentAt ?? item.SentAt ?? new Date().toISOString()),
    isRead: Boolean(item.isRead ?? item.IsRead ?? false),
    conversationId: String(conversationId),
    updatedAt:
      item.updatedAt != null || item.UpdatedAt != null
        ? String(item.updatedAt ?? item.UpdatedAt)
        : undefined,
  };
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

function normalizePaginatedMessages(raw: unknown): unknown[] {
  if (!raw || typeof raw !== "object") return []
  const o = raw as Record<string, unknown>
  const directData = o.data ?? o.Data
  if (Array.isArray(directData)) return directData
  if (directData && typeof directData === "object") {
    const inner = directData as Record<string, unknown>
    const nested = inner.data ?? inner.Data
    if (Array.isArray(nested)) return nested
  }
  const messagesWrapper = o.messages ?? o.Messages
  if (messagesWrapper && typeof messagesWrapper === "object") {
    const inner = messagesWrapper as Record<string, unknown>
    const nested = inner.data ?? inner.Data
    if (Array.isArray(nested)) return nested
  }
  return []
}

/**
 * GET /api/Chat/conversations/{id}/messages returns Response&lt;ConversationMessagesResponseDto&gt;:
 * { messages: PaginatedResult&lt;Message&gt;, isBlocked } — message rows live at messages.data.
 */
export function parseConversationMessagesJson(raw: unknown): {
  messages: Message[];
  isBlocked: boolean;
} {
  // isBlocked is on the top-level Response<T> wrapper, not inside data
  const topLevel = (raw ?? {}) as Record<string, unknown>
  const isBlocked = Boolean(topLevel.isBlocked ?? topLevel.IsBlocked)

  const inner = unwrapEnvelope(raw);
  if (!inner || typeof inner !== "object") {
    return { messages: [], isBlocked };
  }
  const o = inner as Record<string, unknown>;
  const pageData = normalizePaginatedMessages(o);
  const messages = pageData
    .map(normalizeMessage)
    .filter((message): message is Message => Boolean(message))
  return { messages, isBlocked };
}

export const chatApi = {
  getConversations: async () => {
    return getConversations() as Promise<Conversation[]>;
  },

  getConversationWith: (userId: string) =>
    getConversationWith(userId) as Promise<Conversation>,

  createConversation: (userId: string) =>
    createConversation(userId) as Promise<Conversation>,

  deleteConversation: (conversationId: string) =>
    deleteConversation(conversationId),

  getMessages: async (conversationId: string, pageNumber = 1, pageSize = 20) => {
    const raw = await api.get<unknown>(
      `${endpoints.chat.messages(conversationId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return parseConversationMessagesJson(raw);
  },

  sendMessage: async (receiverId: string, messageText: string) => {
    const r = await api.post<{ data?: Message; Data?: Message }>(endpoints.chat.sendMessage, {
      receiverId,
      messageText,
    });
    return normalizeMessage(unwrap(r));
  },

  updateMessage: (messageId: string, messageText: string) =>
    api.put(endpoints.chat.updateMessage(messageId), { messageText }),

  deleteMessage: (messageId: string) =>
    api.delete(endpoints.chat.deleteMessage(messageId)),

  markAsRead: (conversationId: string) =>
    api.put(endpoints.chat.markRead(conversationId), {}),

  getUnreadCount: async (conversationId: string) => {
    const r = await api.get<{ data?: number; Data?: number }>(
      endpoints.chat.unreadCount(conversationId)
    );
    return unwrap(r) ?? 0;
  },
};
