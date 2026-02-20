"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Heart, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

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

  // Don't show on auth pages or desktop
  const hideOnRoutes = ["/login", "/signup", "/register", "/forget-password", "/forgot-password"]
  const shouldHide = hideOnRoutes.some((route) => pathname?.startsWith(route))

  if (!isMobile || shouldHide) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* iOS-style blur background with rounded top corners */}
      <div 
        className="absolute inset-0 bg-background/80 dark:bg-background/70 backdrop-blur-2xl border-t border-border/40"
        style={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}
      />
      
      {/* Content with safe area padding */}
      <div 
        className="relative flex h-20 items-center justify-around pt-2"
        style={{
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
                "active:scale-95 active:opacity-70",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "size-6 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                />
              </div>
              <span 
                className={cn(
                  "text-[11px] transition-all duration-200",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.title}
              </span>
              {/* iOS-style active indicator dot */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
