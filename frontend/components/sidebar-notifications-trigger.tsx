"use client"

import { Bell } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { NotificationsDialog } from "@/components/notifications-dialog"
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
            className="cursor-pointer"
          >
            <Bell className="size-4" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <SidebarMenuBadge>{unreadCount > 99 ? "99+" : unreadCount}</SidebarMenuBadge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <NotificationsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
