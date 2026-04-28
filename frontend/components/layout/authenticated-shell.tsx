"use client"

import type { CSSProperties, ReactNode } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader, type SiteHeaderProps } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const authenticatedSidebarStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as CSSProperties

type AuthenticatedShellProps = {
  children: ReactNode
  siteHeaderProps?: SiteHeaderProps
  sidebarInsetClassName?: string
}

export function AuthenticatedShell({
  children,
  siteHeaderProps,
  sidebarInsetClassName,
}: AuthenticatedShellProps) {
  return (
    <SidebarProvider
      style={authenticatedSidebarStyle}
      className="bg-[radial-gradient(circle_at_12%_8%,rgba(244,63,94,0.16),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(251,146,60,0.12),transparent_24%),var(--background)]"
    >
      <AppSidebar variant="inset" />
      <SidebarInset
        className={`border border-border/60 bg-background/85 backdrop-blur-xl dark:bg-background/88 ${sidebarInsetClassName ?? ""}`}
      >
        <SiteHeader {...siteHeaderProps} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
