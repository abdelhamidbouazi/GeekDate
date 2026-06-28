import { apiClient, unwrapData } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export type NotificationType = 1 | 2 | 3 | 4 | 5

export interface NotificationDto {
  id: string
  userId: string
  fromUserId: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

function normalizeNotificationType(value: unknown): NotificationType {
  if (typeof value === "number" && [1, 2, 3, 4, 5].includes(value)) {
    return value as NotificationType
  }
  const label = String(value ?? "").toLowerCase()
  if (label === "like") return 1
  if (label === "profilevisit" || label === "profile_visit" || label === "visit") return 2
  if (label === "message") return 3
  if (label === "match") return 4
  if (label === "unlike") return 5
  return 1
}

function normalizeNotification(raw: unknown): NotificationDto | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const id = item.id ?? item.Id
  const userId = item.userId ?? item.UserId
  const fromUserId = item.fromUserId ?? item.FromUserId
  if (!id || !userId || !fromUserId) return null
  return {
    id: String(id),
    userId: String(userId),
    fromUserId: String(fromUserId),
    type: normalizeNotificationType(item.type ?? item.Type),
    isRead: Boolean(item.isRead ?? item.IsRead ?? false),
    createdAt: String(item.createdAt ?? item.CreatedAt ?? new Date().toISOString()),
  }
}

function parseList(raw: unknown): NotificationDto[] {
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data)
    ? data.map(normalizeNotification).filter((item): item is NotificationDto => Boolean(item))
    : []
}

export async function getAllNotifications(): Promise<NotificationDto[]> {
  const raw = await apiClient.get<unknown>(endpoints.notifications.all)
  return parseList(raw)
}

export async function getUnreadNotifications(): Promise<NotificationDto[]> {
  const raw = await apiClient.get<unknown>(endpoints.notifications.unread)
  return parseList(raw)
}

export async function getUnreadCount(): Promise<number> {
  const raw = await apiClient.get<unknown>(endpoints.notifications.unreadCount)
  const data = unwrapData<unknown>(raw)
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    const count = record.count ?? record.Count
    if (typeof count === "number") return count
  }
  return 0
}

export function markNotificationsRead() {
  return apiClient.put<void>(endpoints.notifications.markRead, {})
}

export function markOneNotificationRead(id: string) {
  return apiClient.put<void>(endpoints.notifications.markOneRead(id), {})
}

export function deleteNotification(id: string) {
  return apiClient.delete<void>(endpoints.notifications.delete(id))
}
