"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Filter } from "lucide-react"

const pageNames: Record<string, string> = {
  "/browse": "Browse",
  "/matches": "Matches",
  "/messages": "Messages",
  "/profile-views": "Profile Views",
  "/profile": "My Profile",
  "/settings": "Settings",
}

interface SiteHeaderProps {
  onFiltersOpen?: () => void
}

export function SiteHeader({ onFiltersOpen }: SiteHeaderProps = {}) {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || "GeekDate"
  const showFilters = pathname === "/browse" && onFiltersOpen

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageName}</h1>
        <div className="ml-auto flex items-center gap-2">
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFiltersOpen}
              className="gap-2"
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          )}
          <ThemeToggle />
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/abdelhamidbouazi/GeekDate"
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
