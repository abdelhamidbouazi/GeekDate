"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  NotificationItem,
  type Notification,
} from "@/features/notifications/components/notification-item"
import { CheckCheck, Inbox } from "lucide-react"
import { profileApi, resolveProfileMediaUrl } from "@/lib/services/profile-api"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function mapApiNotification(
  n: { id: string; type: number; isRead: boolean; createdAt: string; fromUserId?: string; fromUser?: { firstName?: string; lastName?: string; userName?: string; photoProfileUrl?: string } }
): Notification {
  const typeMap: Record<number, Notification["type"]> = {
    1: "like",
    2: "visit",
    3: "message",
    4: "match",
    5: "unlike",
  }
  const name =
    n.fromUser
      ? [n.fromUser.firstName, n.fromUser.lastName].filter(Boolean).join(" ") || n.fromUser.userName || "Someone"
      : "Someone"
  const textMap: Record<number, string> = {
    1: `${name} liked your profile`,
    2: `${name} viewed your profile`,
    3: `${name} sent you a message`,
    4: `It's a match! You and ${name} liked each other`,
    5: `${name} unliked your profile`,
  }
  return {
    id: n.id,
    type: typeMap[n.type] ?? "like",
    text: textMap[n.type] ?? "New notification",
    user: { name, avatar: resolveProfileMediaUrl(n.fromUser?.photoProfileUrl) ?? PLACEHOLDER_AVATAR },
    unread: !n.isRead,
    createdAt: new Date(n.createdAt),
  }
}

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23999' width='40' height='40'/%3E%3C/svg%3E"

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { notificationApi } = await import("@/lib/services/notification-api")
      const list = await notificationApi.getUnread()
      const enriched = await Promise.all(
        list.map(async (notification) => {
          if (!notification.fromUserId) return notification
          const fromUser = await profileApi.getUser(notification.fromUserId).catch(() => null)
          const mainPhoto = fromUser?.photos?.find((photo) => photo.isMain) ?? fromUser?.photos?.[0]
          return {
            ...notification,
            fromUser: fromUser
              ? {
                  firstName: fromUser.firstName,
                  lastName: fromUser.lastName,
                  userName: fromUser.userName,
                  photoProfileUrl: mainPhoto?.url ?? fromUser.photoProfileUrl ?? undefined,
                }
              : undefined,
          }
        })
      )
      setNotifications(enriched.map(mapApiNotification))
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const handleMarkUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: true } : n))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { notificationApi } = await import("@/lib/services/notification-api")
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    }
  }

  const handleMute = (id: string) => {
    // Placeholder for mute functionality
    console.log("Mute user for notification:", id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[560px] h-[600px] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-semibold">Notifications</DialogTitle>
              <DialogDescription className="mt-1.5">
                Real-time updates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Inbox className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You&apos;re all caught up! No new notifications.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onMarkUnread={handleMarkUnread}
                  onDelete={handleDelete}
                  onMute={handleMute}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-4 border-t flex-shrink-0 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex-1"
              >
                <CheckCheck className="size-4 mr-2" />
                Mark all as read
              </Button>
            )}
            <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
