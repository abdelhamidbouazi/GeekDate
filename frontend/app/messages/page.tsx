"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, MoreVertical } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const conversations = [
  {
    id: 1,
    name: "Alex",
    avatar: "/image3.webp",
    lastMessage: "Hey! I saw you're into React too. Want to collaborate on something?",
    time: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Sam",
    avatar: "/image2.jpeg",
    lastMessage: "Thanks for the match! Love your projects on GitHub.",
    time: "1h ago",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Taylor",
    avatar: "/image4.jpg",
    lastMessage: "Are you going to the tech meetup next week?",
    time: "3h ago",
    unread: 1,
    online: false,
  },
]

export default function MessagesPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-hidden">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 flex-1 overflow-hidden">
              <div className="px-4 lg:px-6 flex-1 flex flex-col overflow-hidden">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <MessageCircle className="size-6 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">
                      Chat with your matches and start meaningful conversations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
                  <Card className="lg:col-span-1 flex flex-col overflow-hidden">
                    <CardHeader>
                      <Input placeholder="Search conversations..." />
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                      <div className="space-y-1">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
                          >
                            <div className="relative">
                              <div className="relative size-12 rounded-full overflow-hidden">
                                <Image
                                  src={conversation.avatar}
                                  alt={conversation.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              {conversation.online && (
                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate">{conversation.name}</h3>
                                <span className="text-xs text-muted-foreground">{conversation.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            </div>
                            {conversation.unread > 0 && (
                              <div className="flex-shrink-0 size-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                                {conversation.unread}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 flex flex-col overflow-hidden min-h-0">
                    <CardHeader className="border-b flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-full overflow-hidden">
                            <Image
                              src="/image3.webp"
                              alt="Alex"
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">Alex</h3>
                            <p className="text-xs text-muted-foreground">Online</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Block</DropdownMenuItem>
                            <DropdownMenuItem>Report</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
                      <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
                        <div className="flex gap-3">
                          <div className="relative size-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src="/image3.webp"
                              alt="Alex"
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                              <p className="text-sm">Hey! I saw you're into React too. Want to collaborate on something?</p>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 block">2 minutes ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t flex-shrink-0">
                        <Input placeholder="Type a message..." className="flex-1" />
                        <Button size="icon">
                          <Send className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
