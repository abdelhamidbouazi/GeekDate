"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavComingSoon({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: number | null
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const handleClick = (item: { title: string; icon: LucideIcon }) => {
    toast.info(`${item.title} is coming soon!`, {
      description: "This feature is currently under construction. We're working hard to bring you an amazing experience. Stay tuned!",
      icon: <item.icon className="size-4" />,
    })
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                onClick={() => handleClick(item)}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
