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

export async function getUnreadNotifications(): Promise<NotificationDto[]> {
  const raw = await apiClient.get<unknown>(endpoints.notifications.unread)
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data)
    ? data.map(normalizeNotification).filter((item): item is NotificationDto => Boolean(item))
    : []
}

export function markNotificationsRead() {
  return apiClient.put<void>(endpoints.notifications.markRead, {})
}

