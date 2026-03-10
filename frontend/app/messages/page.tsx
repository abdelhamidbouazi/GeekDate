"use client"

import { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { chatApi, type Conversation, type Message } from "@/lib/chat-api"
import { profileApi, getUserIdFromToken } from "@/lib/profile-api"

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect fill='%23999' width='48' height='48'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16'%3E?%3C/text%3E%3C/svg%3E"

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ""
  }
}

export default function MessagesPage() {
  const currentUserId = getUserIdFromToken()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({})
  const [partnerAvatars, setPartnerAvatars] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const getOtherUserId = useCallback(
    (c: Conversation) =>
      currentUserId === c.user1Id ? c.user2Id : c.user1Id,
    [currentUserId]
  )

  const loadConversations = useCallback(async () => {
    if (!currentUserId) return
    setLoading(true)
    try {
      const list = await chatApi.getConversations()
      setConversations(list)
      const names: Record<string, string> = {}
      const avatars: Record<string, string> = {}
      for (const c of list) {
        const otherId = getOtherUserId(c)
        try {
          const user = await profileApi.getUser(otherId)
          const main = user.photos?.find((p) => p.isMain) ?? user.photos?.[0]
          names[otherId] =
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.userName ||
            "User"
          avatars[otherId] = main?.url ?? user.photoProfileUrl ?? PLACEHOLDER
        } catch {
          names[otherId] = "User"
          avatars[otherId] = PLACEHOLDER
        }
      }
      setPartnerNames(names)
      setPartnerAvatars(avatars)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [currentUserId, getOtherUserId, selected])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const loadMessages = useCallback(async (conv: Conversation) => {
    setMessagesLoading(true)
    try {
      const result = await chatApi.getMessages(conv.id)
      const msgs = Array.isArray(result?.data) ? result.data : (result as { Data?: Message[] })?.Data ?? []
      setMessages(msgs)
      chatApi.markAsRead(conv.id).catch(() => {})
    } catch {
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selected) loadMessages(selected)
  }, [selected, loadMessages])

  const handleSend = useCallback(async () => {
    if (!selected || !newMessage.trim() || sending) return
    const otherId = getOtherUserId(selected)
    setSending(true)
    try {
      await chatApi.sendMessage(otherId, newMessage.trim())
      setNewMessage("")
      loadMessages(selected)
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }, [selected, newMessage, sending, getOtherUserId, loadMessages])

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    )
  }

  const selectedOtherId = selected ? getOtherUserId(selected) : null
  const selectedName = selectedOtherId
    ? partnerNames[selectedOtherId] ?? "User"
    : ""
  const selectedAvatar = selectedOtherId
    ? partnerAvatars[selectedOtherId] ?? PLACEHOLDER
    : PLACEHOLDER

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
                    <h1 className="text-3xl font-bold tracking-tight">
                      Messages
                    </h1>
                    <p className="text-muted-foreground">
                      Chat with your matches and start meaningful conversations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
                  <Card className="lg:col-span-1 flex flex-col overflow-hidden">
                    <CardHeader>
                      <Input placeholder="Search conversations..." readOnly />
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : conversations.length === 0 ? (
                        <p className="text-muted-foreground text-sm p-4 text-center">
                          No conversations yet. Match with someone to start chatting!
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {conversations.map((conv) => {
                            const otherId = getOtherUserId(conv)
                            const name = partnerNames[otherId] ?? "User"
                            const avatar = partnerAvatars[otherId] ?? PLACEHOLDER
                            const unread = conv.unreadCount ?? 0
                            return (
                              <button
                                key={conv.id}
                                type="button"
                                className="flex w-full items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50 text-left"
                                onClick={() => setSelected(conv)}
                              >
                                <div className="relative size-12 rounded-full overflow-hidden shrink-0">
                                  <Image
                                    src={avatar}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized={avatar.startsWith("data:")}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-sm truncate">
                                      {name}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    Conversation
                                  </p>
                                </div>
                                {unread > 0 && (
                                  <div className="shrink-0 size-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                                    {unread}
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 flex flex-col overflow-hidden min-h-0">
                    {selected ? (
                      <>
                        <CardHeader className="border-b shrink-0">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/users/${selectedOtherId}`}
                              className="flex items-center gap-3 hover:opacity-80"
                            >
                              <div className="relative size-10 rounded-full overflow-hidden">
                                <Image
                                  src={selectedAvatar}
                                  alt={selectedName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  unoptimized={selectedAvatar.startsWith("data:")}
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold">{selectedName}</h3>
                                <p className="text-xs text-muted-foreground">
                                  <Link
                                    href={`/users/${selectedOtherId}`}
                                    className="hover:underline"
                                  >
                                    View profile
                                  </Link>
                                </p>
                              </div>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
                          {messagesLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                              <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
                              {messages.map((msg) => {
                                const isMe = msg.senderId === currentUserId
                                return (
                                  <div
                                    key={msg.id}
                                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                                  >
                                    <div
                                      className={`flex-1 max-w-[80%] ${
                                        isMe
                                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3"
                                          : "bg-muted rounded-2xl rounded-tl-sm p-3"
                                      }`}
                                    >
                                      <p className="text-sm">{msg.messageText}</p>
                                      <span
                                        className={`text-xs mt-1 block ${
                                          isMe
                                            ? "text-primary-foreground/80"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {formatTime(msg.sentAt)}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                              {messages.length === 0 && !messagesLoading && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  No messages yet. Say hi!
                                </p>
                              )}
                            </div>
                          )}
                          <form
                            className="flex gap-2 mt-4 pt-4 border-t shrink-0"
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleSend()
                            }}
                          >
                            <Input
                              placeholder="Type a message..."
                              className="flex-1"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              disabled={sending}
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={
                                !newMessage.trim() || sending
                              }
                            >
                              {sending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Send className="size-4" />
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-8">
                        <p className="text-muted-foreground text-center">
                          {conversations.length === 0
                            ? "No conversations yet. Match with someone to start chatting!"
                            : "Select a conversation"}
                        </p>
                      </div>
                    )}
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
