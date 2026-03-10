"use client"

import * as React from "react"
import { useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Heart,
  MessageCircle,
  Eye,
  User,
  Settings,
  Video,
  Radio,
  Sparkles,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavComingSoon } from "@/components/nav-coming-soon"
import { NavUser } from "@/components/nav-user"
import { SidebarNotificationsTrigger } from "@/components/sidebar-notifications-trigger"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { profileApi, getUserIdFromToken } from "@/lib/profile-api"

const defaultUser = {
  name: "Your Profile",
  email: "",
  avatar: "/geeksdatingnobg.png",
}

const navMainItems = [
  { title: "Browse", url: "/browse", icon: Search },
  { title: "Matches", url: "/matches", icon: Heart },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Profile Views", url: "/profile-views", icon: Eye },
]

const navSecondary = [
  { title: "My Profile", url: "/profile", icon: User, badge: null },
  { title: "Settings", url: "/settings", icon: Settings, badge: null },
]

const navComingSoon = [
  { title: "Shorts", url: "/shorts", icon: Video, badge: null },
  { title: "Streaming", url: "/streaming", icon: Radio, badge: null },
  { title: "AI Chat", url: "/ai-chat", icon: Sparkles, badge: null },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(defaultUser)
  const [badges, setBadges] = React.useState<{ matches: number; messages: number; profileViews: number }>({
    matches: 0,
    messages: 0,
    profileViews: 0,
  })
  const [notifCount, setNotifCount] = React.useState(0)

  const fetchBadges = useCallback(async () => {
    try {
      const [likes, convs, views, notifs] = await Promise.all([
        import("@/lib/profile-api").then((m) => m.profileApi.getProfileLikes()),
        import("@/lib/chat-api").then((m) => m.chatApi.getConversations()),
        import("@/lib/profile-api").then((m) => m.profileApi.getProfileViews()),
        import("@/lib/notification-api").then((m) => m.notificationApi.getUnread()),
      ])
      const likesList = Array.isArray(likes) ? likes : []
      const convsList = Array.isArray(convs) ? convs : []
      const viewsList = Array.isArray(views) ? views : []
      const notifsList = Array.isArray(notifs) ? notifs : []
      const totalUnread = convsList.reduce((s, c) => s + (c.unreadCount ?? 0), 0)
      setBadges({
        matches: likesList.length,
        messages: totalUnread,
        profileViews: viewsList.length,
      })
      setNotifCount(notifsList.length)
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    const userId = getUserIdFromToken()
    if (!userId) return
    profileApi
      .getUser(userId)
      .then((data) => {
        const mainPhoto = data.photos?.find((p) => p.isMain) ?? data.photos?.[0]
        setUser({
          name:
            [data.firstName, data.lastName].filter(Boolean).join(" ") || data.userName || defaultUser.name,
          email: data.email ?? "",
          avatar: mainPhoto?.url ?? data.photoProfileUrl ?? defaultUser.avatar,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const uid = getUserIdFromToken()
    if (uid) fetchBadges()
  }, [fetchBadges])

  const data = {
    navMain: navMainItems.map((item) => ({
      ...item,
      badge:
        item.title === "Matches"
          ? badges.matches
          : item.title === "Messages"
            ? badges.messages
            : item.title === "Profile Views"
              ? badges.profileViews
              : null,
    })),
    navSecondary,
    navComingSoon,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/home">
                <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-background/50 p-1 border border-border/30">
                  <Image
                    src="/geeksdatingnobg.png"
                    alt="GeekDate Logo"
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                <span className="text-base font-semibold">GeekDate</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarSeparator />
        <SidebarNotificationsTrigger unreadCount={notifCount} />
        <SidebarSeparator />
        <NavComingSoon items={data.navComingSoon} />
        <SidebarSeparator />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
