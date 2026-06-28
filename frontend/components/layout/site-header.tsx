"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Filter, Heart } from "lucide-react"
import { BRAND } from "@/lib/branding"

const pageNames: Record<string, string> = {
  "/browse": "Browse",
  "/matches": "Matches",
  "/likes": "Likes",
  "/messages": "Messages",
  "/profile-views": "Profile Views",
  "/profile": "My Profile",
}

export type SiteHeaderProps = {
  onFiltersOpen?: () => void
}

export function SiteHeader({ onFiltersOpen }: SiteHeaderProps = {}) {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || BRAND.name
  const showFilters = pathname === "/browse" && onFiltersOpen

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 bg-background/70 backdrop-blur-2xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10 hover:text-primary" />
        <Separator
          orientation="vertical"
          className="mx-2 bg-border/70 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <span className="hidden size-8 place-items-center rounded-full bg-linear-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/20 sm:grid">
            <Heart className="size-4 fill-current" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">
              {BRAND.name}
            </p>
            <h1 className="text-base font-black tracking-tight">{pageName}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFiltersOpen}
              className="gap-2 rounded-full border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="hidden rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary sm:flex"
          >
            <a
              href="https://github.com/abdelhamidbouazi/SparkDates"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Repository
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
