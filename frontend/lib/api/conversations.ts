import { apiClient, unwrapData } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export interface ConversationDto {
  id: string
  user1Id: string
  user2Id: string
  createdAt: string
  unreadCount?: number
}

function normalizeConversation(raw: unknown): ConversationDto | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const id = item.id ?? item.Id
  const user1Id = item.user1Id ?? item.User1Id
  const user2Id = item.user2Id ?? item.User2Id
  if (!id || !user1Id || !user2Id) return null
  return {
    id: String(id),
    user1Id: String(user1Id),
    user2Id: String(user2Id),
    createdAt: String(item.createdAt ?? item.CreatedAt ?? ""),
    unreadCount: Number(item.unreadCount ?? item.UnreadCount ?? 0),
  }
}

export async function getConversations(): Promise<ConversationDto[]> {
  const raw = await apiClient.get<unknown>(endpoints.conversations.list)
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data)
    ? data.map(normalizeConversation).filter((item): item is ConversationDto => Boolean(item))
    : []
}

export function getConversationWith(userId: string) {
  return apiClient.get<unknown>(endpoints.conversations.withUser(userId)).then((raw) => normalizeConversation(raw) as ConversationDto)
}

export function createConversation(userId: string) {
  return apiClient.post<unknown>(endpoints.conversations.withUser(userId), {}).then((raw) => normalizeConversation(raw) as ConversationDto)
}

export function deleteConversation(conversationId: string) {
  return apiClient.delete<void>(endpoints.conversations.byId(conversationId))
}

