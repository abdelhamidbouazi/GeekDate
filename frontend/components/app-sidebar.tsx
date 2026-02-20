"use client"

import * as React from "react"
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

const data = {
  navMain: [
    {
      title: "Browse",
      url: "/browse",
      icon: Search,
      badge: null,
    },
    {
      title: "Matches",
      url: "/matches",
      icon: Heart,
      badge: 12,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageCircle,
      badge: 5,
    },
    {
      title: "Profile Views",
      url: "/profile-views",
      icon: Eye,
      badge: 24,
    },
  ],
  navSecondary: [
    {
      title: "My Profile",
      url: "/profile",
      icon: User,
      badge: null,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      badge: null,
    },
  ],
  navComingSoon: [
    {
      title: "Shorts",
      url: "/shorts",
      icon: Video,
      badge: null,
    },
    {
      title: "Streaming",
      url: "/streaming",
      icon: Radio,
      badge: null,
    },
    {
      title: "AI Chat",
      url: "/ai-chat",
      icon: Sparkles,
      badge: null,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(defaultUser)

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
        <SidebarNotificationsTrigger unreadCount={3} />
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
