import api from './client';
import type { ApiResponse, Conversation, Message, PaginatedResult } from '../types';

export const chatApi = {
  // WRAPPED — returns Response<IReadOnlyCollection<Conversation>>
  getConversations: () =>
    api.get<ApiResponse<Conversation[]>>('/conversation'),

  // RAW — returns Conversation directly
  getConversationWith: (userId: string) =>
    api.get<Conversation>(`/conversation/with/${userId}`),

  // RAW — returns Conversation directly (CreatedAtAction)
  createConversation: (userId: string) =>
    api.post<Conversation>(`/conversation/with/${userId}`),

  deleteConversation: (conversationId: string) =>
    api.delete(`/conversation/${conversationId}`),

  // WRAPPED — returns Response<PaginatedResult<Message>>
  getMessages: (conversationId: string, pageNumber = 1, pageSize = 20) =>
    api.get<ApiResponse<PaginatedResult<Message>>>(`/chat/conversations/${conversationId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  // WRAPPED — returns Response<Message>
  sendMessage: (receiverId: string, messageText: string) =>
    api.post<ApiResponse<Message>>('/chat/send-message', { receiverId, messageText }),

  // WRAPPED
  updateMessage: (messageId: string, messageText: string) =>
    api.put<ApiResponse<boolean>>(`/chat/messages/${messageId}`, { messageText }),

  // WRAPPED
  deleteMessage: (messageId: string) =>
    api.delete<ApiResponse<boolean>>(`/chat/messages/${messageId}`),

  // WRAPPED
  markAsRead: (conversationId: string) =>
    api.put<ApiResponse<boolean>>(`/chat/conversations/${conversationId}/mark-read`),

  // WRAPPED
  getUnreadCount: (conversationId: string) =>
    api.get<ApiResponse<number>>(`/chat/conversations/${conversationId}/unread-count`),
};
