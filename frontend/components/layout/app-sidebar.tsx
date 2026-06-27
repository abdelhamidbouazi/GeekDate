"use client"

import * as React from "react"
import { useCallback, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Heart,
  ThumbsUp,
  MessageCircle,
  Eye,
  User,
  Settings,
  Video,
  Radio,
  Sparkles,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavComingSoon } from "@/components/layout/nav-coming-soon"
import { NavUser } from "@/components/layout/nav-user"
import { SidebarNotificationsTrigger } from "@/components/layout/sidebar-notifications-trigger"
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
import { profileApi, getUserIdFromToken } from "@/lib/services/profile-api"
import { BRAND } from "@/lib/branding"

const defaultUser = {
  name: "Your Profile",
  email: "",
  avatar: "/sparkdates-logo.svg",
}

const navMainItems = [
  { title: "Browse", url: "/browse", icon: Search },
  { title: "Matches", url: "/matches", icon: Heart },
  { title: "Likes", url: "/likes", icon: ThumbsUp },
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
  const [badges, setBadges] = React.useState<{
    matches: number
    likes: number
    messages: number
    profileViews: number
  }>({
    matches: 0,
    likes: 0,
    messages: 0,
    profileViews: 0,
  })
  const [notifCount, setNotifCount] = React.useState(0)

  const fetchBadges = useCallback(async () => {
    try {
      const [matchList, likesReceived, convs, views, notifs] = await Promise.all([
        import("@/lib/services/profile-api").then((m) =>
          m.profileApi.getMatches()
        ),
        import("@/lib/services/profile-api").then((m) =>
          m.profileApi.getLikesReceived()
        ),
        import("@/lib/services/chat-api").then((m) => m.chatApi.getConversations()),
        import("@/lib/services/profile-api").then((m) =>
          m.profileApi.getProfileViews()
        ),
        import("@/lib/services/notification-api").then((m) =>
          m.notificationApi.getUnread()
        ),
      ])
      const matchesList = Array.isArray(matchList) ? matchList : []
      const likesList = Array.isArray(likesReceived) ? likesReceived : []
      const convsList = Array.isArray(convs) ? convs : []
      const viewsList = Array.isArray(views) ? views : []
      const notifsList = Array.isArray(notifs) ? notifs : []
      const totalUnread = convsList.reduce((s, c) => s + (c.unreadCount ?? 0), 0)
      setBadges({
        matches: matchesList.length,
        likes: likesList.length,
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
          : item.title === "Likes"
            ? badges.likes
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
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-14 rounded-2xl bg-linear-to-r from-rose-500 via-pink-500 to-orange-400 px-3 text-white shadow-lg shadow-rose-500/25 hover:from-rose-500 hover:to-orange-400 hover:text-white data-[slot=sidebar-menu-button]:!p-3"
            >
              <Link href="/home">
                <div className="grid size-9 place-items-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <Heart className="size-5 fill-white text-white" />
                </div>
                <div className="grid leading-tight">
                  <span className="text-base font-black tracking-tight">{BRAND.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
                    Real sparks
                  </span>
                </div>
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
