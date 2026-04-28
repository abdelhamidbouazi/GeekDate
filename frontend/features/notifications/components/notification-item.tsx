"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  Eye,
  MessageCircle,
  Sparkles,
  MoreVertical,
  CheckCheck,
  X,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = "like" | "visit" | "message" | "match" | "unlike"

export interface Notification {
  id: string
  type: NotificationType
  text: string
  user: {
    name: string
    avatar: string
  }
  unread: boolean
  createdAt: Date
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onMarkUnread: (id: string) => void
  onDelete: (id: string) => void
  onMute?: (id: string) => void
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "like":
      return <Heart className="size-4 text-foreground" />
    case "visit":
      return <Eye className="size-4 text-foreground" />
    case "message":
      return <MessageCircle className="size-4 text-foreground" />
    case "match":
      return <Sparkles className="size-4 text-foreground" />
    case "unlike":
      return <Heart className="size-4 text-foreground" />
    default:
      return <Heart className="size-4 text-foreground" />
  }
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onMute,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-4 transition-colors",
        "hover:bg-muted/50 focus-within:bg-muted/50",
        notification.unread && "bg-primary/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {notification.unread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full bg-primary" />
      )}

      {/* Type icon - vertically centered */}
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Avatar */}
      <Avatar className="size-10 ring-2 ring-background flex-shrink-0">
        <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
        <AvatarFallback>
          {notification.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm leading-relaxed line-clamp-2",
                notification.unread ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {notification.text}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatTimestamp(notification.createdAt)}
            </p>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7 opacity-0 group-hover:opacity-100 transition-opacity",
                  isHovered && "opacity-100"
                )}
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {notification.unread ? (
                <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                  <CheckCheck className="size-4 mr-2" />
                  Mark as read
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onMarkUnread(notification.id)}>
                  <CheckCheck className="size-4 mr-2" />
                  Mark as unread
                </DropdownMenuItem>
              )}
              {onMute && (
                <DropdownMenuItem onClick={() => onMute(notification.id)}>
                  <VolumeX className="size-4 mr-2" />
                  Mute user
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(notification.id)}
                className="text-destructive focus:text-destructive"
              >
                <X className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
