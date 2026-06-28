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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  NotificationItem,
  type Notification,
} from "@/features/notifications/components/notification-item"
import { parseTimestamp } from "@/lib/utils/time"
import { CheckCheck, Inbox } from "lucide-react"
import { profileApi, resolveProfileMediaUrl } from "@/lib/services/profile-api"
import { notificationApi } from "@/lib/services/notification-api"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnreadCountChange?: (count: number) => void
}

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23999' width='40' height='40'/%3E%3C/svg%3E"

function mapApiNotification(n: {
  id: string
  type: number
  isRead: boolean
  createdAt: string
  fromUserId?: string
  fromUser?: {
    firstName?: string
    lastName?: string
    userName?: string
    photoProfileUrl?: string
  }
}): Notification {
  const typeMap: Record<number, Notification["type"]> = {
    1: "like",
    2: "visit",
    3: "message",
    4: "match",
    5: "unlike",
  }
  const actor =
    n.fromUser
      ? [n.fromUser.firstName, n.fromUser.lastName].filter(Boolean).join(" ") ||
        n.fromUser.userName ||
        "Someone"
      : "Someone"
  const textMap: Record<number, string> = {
    1: `${actor} liked your profile.`,
    2: `${actor} viewed your profile.`,
    3: `${actor} sent you a message.`,
    4: `You matched with ${actor}.`,
    5: `${actor} unliked your profile.`,
  }
  return {
    id: n.id,
    type: typeMap[n.type] ?? "like",
    text: textMap[n.type] ?? "New notification.",
    user: {
      name: actor,
      avatar: resolveProfileMediaUrl(n.fromUser?.photoProfileUrl) ?? PLACEHOLDER_AVATAR,
    },
    unread: !n.isRead,
    createdAt: parseTimestamp(n.createdAt) ?? new Date(n.createdAt),
  }
}

type TabValue = "all" | "visits" | "likes" | "matches" | "messages"

const TAB_TYPES: Record<TabValue, number[] | null> = {
  all: null,
  visits: [2],
  likes: [1],
  matches: [4],
  messages: [3],
}

function filterByTab(notifications: Notification[], raw: { type: number }[], tab: TabValue): Notification[] {
  const allowed = TAB_TYPES[tab]
  if (!allowed) return notifications
  return notifications.filter((_, i) => allowed.includes(raw[i]?.type ?? -1))
}

function NotificationsSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NotificationsDialog({
  open,
  onOpenChange,
  onUnreadCountChange,
}: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [rawTypes, setRawTypes] = useState<{ type: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>("all")

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const list = await notificationApi.getAll()
      const enriched = await Promise.all(
        list.map(async (n) => {
          if (!n.fromUserId) return n
          const fromUser = await profileApi.getUser(n.fromUserId).catch(() => null)
          const mainPhoto =
            fromUser?.photos?.find((p) => p.isMain) ?? fromUser?.photos?.[0]
          return {
            ...n,
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
      setRawTypes(list.map((n) => ({ type: n.type })))
      setNotifications(enriched.map(mapApiNotification))
      const unreadCount = list.filter((n) => !n.isRead).length
      onUnreadCountChange?.(unreadCount)
    } catch {
      setNotifications([])
      setRawTypes([])
    } finally {
      setLoading(false)
    }
  }, [onUnreadCountChange])

  useEffect(() => {
    if (open) {
      setActiveTab("all")
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
    onUnreadCountChange?.(Math.max(0, unreadCount - 1))
    try {
      await notificationApi.markOneRead(id)
    } catch {
      // optimistic update stands — don't revert to avoid confusing UX
    }
  }

  const handleMarkUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: true } : n))
    )
    onUnreadCountChange?.(unreadCount + 1)
  }

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setRawTypes((prev) => {
      const idx = notifications.findIndex((n) => n.id === id)
      if (idx === -1) return prev
      return prev.filter((_, i) => i !== idx)
    })
    try {
      await notificationApi.delete(id)
    } catch {
      // optimistic removal stands
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    onUnreadCountChange?.(0)
    try {
      await notificationApi.markAllRead()
    } catch {
      // optimistic update stands
    }
  }

  const visibleNotifications = filterByTab(notifications, rawTypes, activeTab)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-150 w-140 flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-2xl font-semibold">Notifications</DialogTitle>
          <DialogDescription className="mt-1">
            Profile views, likes, matches, and messages.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="shrink-0 border-b px-6 pt-3">
            <TabsList className="h-8 w-full justify-start gap-1 bg-transparent p-0">
              {(["all", "visits", "likes", "matches", "messages"] as const).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="h-8 rounded-md px-3 text-xs capitalize data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  {tab === "visits" ? "Views" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {(["all", "visits", "likes", "matches", "messages"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                {loading ? (
                  <NotificationsSkeleton />
                ) : visibleNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-16">
                    <Inbox className="mb-4 size-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
                    <p className="max-w-sm text-center text-sm text-muted-foreground">
                      {tab === "all"
                        ? "You're all caught up! No notifications yet."
                        : `No ${tab === "visits" ? "profile view" : tab.slice(0, -1)} notifications yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {visibleNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onMarkUnread={handleMarkUnread}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="shrink-0 border-t bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex-1"
              >
                <CheckCheck className="mr-2 size-4" />
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
