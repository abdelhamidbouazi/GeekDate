"use client"

import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useSidebar } from "./sidebar-provider"

export function SidebarTrigger() {
  const { toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggle}
    >
      <PanelLeft className="size-5" />
    </Button>
  )
}
