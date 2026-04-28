"use client"

import { Bell } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { NotificationsDialog } from "@/features/notifications/components/notifications-dialog"
import { useState } from "react"

interface SidebarNotificationsTriggerProps {
  unreadCount?: number
}

export function SidebarNotificationsTrigger({
  unreadCount = 0,
}: SidebarNotificationsTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Notifications"
            onClick={() => setOpen(true)}
            className="h-10 cursor-pointer rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <Bell className="size-4" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <SidebarMenuBadge className="text-primary">{unreadCount > 99 ? "99+" : unreadCount}</SidebarMenuBadge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <NotificationsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
