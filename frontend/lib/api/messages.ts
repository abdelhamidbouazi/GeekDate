import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { parseConversationMessagesJson, type Message } from "@/lib/services/chat-api"

export function getMessages(conversationId: string, pageNumber = 1, pageSize = 20) {
  return apiClient
    .get<unknown>(`${endpoints.chat.messages(conversationId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    .then((raw) => parseConversationMessagesJson(raw))
}

export function sendMessage(receiverId: string, messageText: string) {
  return apiClient.post<{ data?: Message; Data?: Message }>(endpoints.chat.sendMessage, {
    receiverId,
    messageText,
  })
}

export function updateMessage(messageId: string, messageText: string) {
  return apiClient.put(endpoints.chat.updateMessage(messageId), { messageText })
}

export function deleteMessage(messageId: string) {
  return apiClient.delete(endpoints.chat.deleteMessage(messageId))
}

export function markConversationRead(conversationId: string) {
  return apiClient.put(endpoints.chat.markRead(conversationId), {})
}

export function getUnreadCount(conversationId: string) {
  return apiClient.get<{ data?: number; Data?: number }>(endpoints.chat.unreadCount(conversationId))
}
