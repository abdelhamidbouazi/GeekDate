"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Heart, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { getUserIdFromToken } from "@/lib/services/profile-api"

const navItems = [
  {
    title: "Browse",
    url: "/browse",
    icon: Search,
  },
  {
    title: "Matches",
    url: "/matches",
    icon: Heart,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [messageCount, setMessageCount] = useState(0)

  const fetchUnread = useCallback(async () => {
    try {
      const { chatApi } = await import("@/lib/services/chat-api")
      const convs = await chatApi.getConversations()
      const list = Array.isArray(convs) ? convs : []
      setMessageCount(list.reduce((s, c) => s + (c.unreadCount ?? 0), 0))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const uid = getUserIdFromToken()
    if (!uid) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  // Don't show on auth pages or desktop
  const hideOnRoutes = ["/home", "/login", "/signup", "/register", "/forget-password", "/forgot-password"]
  const shouldHide = hideOnRoutes.some((route) => pathname?.startsWith(route))

  if (!isMobile || shouldHide) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="absolute inset-0 border-t border-primary/15 bg-background/90 backdrop-blur-2xl dark:bg-background/85"
        style={{
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          boxShadow: "0 -14px 40px rgba(244, 63, 94, 0.16)",
        }}
      />

      <div
        className="relative flex h-20 items-center justify-around pt-2"
        style={{
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url
          return (
            <Button
              key={item.url}
              variant="ghost"
              size="sm"
              className={cn(
                "relative h-auto flex-1 flex-col gap-1 rounded-none py-2 font-normal",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
              asChild
            >
              <Link href={item.url}>
                <span className="relative">
                  <Icon
                    className={cn(
                      "size-6 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                  />
                  {item.title === "Messages" && messageCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {messageCount > 9 ? "9+" : messageCount}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[11px] transition-all duration-200",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {item.title}
                </span>
                {isActive ? (
                  <span className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-linear-to-r from-rose-500 to-orange-400 shadow-lg shadow-rose-500/30" />
                ) : null}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
