"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem, type Notification } from "@/components/notification-item"
import { CheckCheck, Inbox } from "lucide-react"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Dummy notifications data
const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    text: "Alex Chen liked your profile",
    user: {
      name: "Alex Chen",
      avatar: "/image3.webp",
    },
    unread: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    type: "match",
    text: "It's a match! You and Sarah Martinez liked each other",
    user: {
      name: "Sarah Martinez",
      avatar: "/image2.jpeg",
    },
    unread: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "3",
    type: "visit",
    text: "Taylor Swift viewed your profile",
    user: {
      name: "Taylor Swift",
      avatar: "/image4.jpg",
    },
    unread: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "4",
    type: "message",
    text: "Alex Chen sent you a message: 'Hey! I saw we have a lot in common.'",
    user: {
      name: "Alex Chen",
      avatar: "/image3.webp",
    },
    unread: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "5",
    type: "like",
    text: "Riley Johnson liked your profile",
    user: {
      name: "Riley Johnson",
      avatar: "/image5.webp",
    },
    unread: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "6",
    type: "visit",
    text: "Casey Brown viewed your profile",
    user: {
      name: "Casey Brown",
      avatar: "/image2.jpeg",
    },
    unread: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "7",
    type: "match",
    text: "It's a match! You and Quinn Miller liked each other",
    user: {
      name: "Quinn Miller",
      avatar: "/image4.jpg",
    },
    unread: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "8",
    type: "message",
    text: "Sarah Martinez sent you a message: 'Would love to chat about your projects!'",
    user: {
      name: "Sarah Martinez",
      avatar: "/image2.jpeg",
    },
    unread: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "9",
    type: "like",
    text: "Morgan Davis liked your profile",
    user: {
      name: "Morgan Davis",
      avatar: "/image3.webp",
    },
    unread: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "10",
    type: "visit",
    text: "Alex Chen viewed your profile",
    user: {
      name: "Alex Chen",
      avatar: "/image3.webp",
    },
    unread: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
]

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications)

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

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Inbox className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You're all caught up! No new notifications.
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
