"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MessageCircle,
  Send,
  Loader2,
  UserPlus,
  Search,
  Sparkles,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { chatApi, type Conversation, type Message } from "@/lib/services/chat-api"
import {
  profileApi,
  getUserIdFromToken,
  profileViewerDisplayName,
  resolveProfileMediaUrl,
  type ProfileViewerUser,
} from "@/lib/services/profile-api"
import { getApiOrigin } from "@/lib/api/http"
import { AVATAR_PLACEHOLDER_SMALL } from "@/lib/utils/profile"
import { cn } from "@/lib/utils"
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr"

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function sortMessagesAsc(msgs: Message[]): Message[] {
  return [...msgs].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  )
}

export default function MessagesPage() {
  const currentUserId = getUserIdFromToken()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({})
  const [partnerAvatars, setPartnerAvatars] = useState<Record<string, string>>({})
  const [matchedUsers, setMatchedUsers] = useState<ProfileViewerUser[]>([])
  const [matchedLoading, setMatchedLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [startingConversationWith, setStartingConversationWith] = useState<string | null>(null)
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [threadBlocked, setThreadBlocked] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const hubRef = useRef<HubConnection | null>(null)
  const selectedConversationIdRef = useRef<string | null>(null)
  const lastJoinedConversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesPanelRef = useRef<HTMLDivElement | null>(null)

  const getOtherUserId = useCallback(
    (c: Conversation) => (currentUserId === c.user1Id ? c.user2Id : c.user1Id),
    [currentUserId]
  )

  const existingConversationByUserId = useMemo(() => {
    const m = new Map<string, Conversation>()
    for (const c of conversations) m.set(getOtherUserId(c), c)
    return m
  }, [conversations, getOtherUserId])

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
          avatars[otherId] = main?.url ?? user.photoProfileUrl ?? AVATAR_PLACEHOLDER_SMALL
        } catch {
          names[otherId] = "User"
          avatars[otherId] = AVATAR_PLACEHOLDER_SMALL
        }
      }
      setPartnerNames(names)
      setPartnerAvatars(avatars)
      setSelected((prev) => {
        if (list.length === 0) return null
        if (prev && list.some((c) => c.id === prev.id)) return prev
        return list[0]
      })
    } catch (err) {
      setConversations([])
      toast.error(err instanceof Error ? err.message : "Could not load conversations.")
    } finally {
      setLoading(false)
    }
  }, [currentUserId, getOtherUserId])

  useEffect(() => { loadConversations() }, [loadConversations])

  const loadMatchedUsers = useCallback(async () => {
    if (!currentUserId) return
    setMatchedLoading(true)
    try {
      const matches = await profileApi.getMatches()
      const unique = matches.filter(
        (u, i, arr) => u.id && arr.findIndex((x) => x.id === u.id) === i
      )
      setMatchedUsers(unique)
    } catch {
      setMatchedUsers([])
    } finally {
      setMatchedLoading(false)
    }
  }, [currentUserId])

  useEffect(() => { loadMatchedUsers() }, [loadMatchedUsers])

  const loadMessages = useCallback(async (conv: Conversation) => {
    setMessagesLoading(true)
    try {
      const { messages: raw, isBlocked } = await chatApi.getMessages(conv.id)
      setMessages(sortMessagesAsc(raw))
      setThreadBlocked(isBlocked)
      chatApi.markAsRead(conv.id).catch(() => {})
    } catch (err) {
      setMessages([])
      setThreadBlocked(false)
      toast.error(err instanceof Error ? err.message : "Could not load messages.")
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selected) {
      selectedConversationIdRef.current = selected.id
      loadMessages(selected)
    } else {
      selectedConversationIdRef.current = null
    }
  }, [selected, loadMessages])

  useEffect(() => {
    const panel = messagesPanelRef.current
    if (!panel) return
    panel.scrollTop = panel.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!currentUserId || typeof window === "undefined") return
    const hubUrl = `${getApiOrigin()}/chatHub`
    const accessTokenFactory = () => localStorage.getItem("accessToken") ?? ""
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    hubRef.current = conn
    conn.onreconnecting(() => setRealtimeConnected(false))
    conn.onreconnected(async () => {
      setRealtimeConnected(true)
      const id = selectedConversationIdRef.current
      if (id) await conn.invoke("JoinConversation", id).catch(() => {})
    })
    conn.onclose(() => setRealtimeConnected(false))

    conn.on("ReceiveMessage", (payload: unknown) => {
      const obj = (payload ?? {}) as Record<string, unknown>
      const incomingConversationId = String(obj.conversationId ?? obj.ConversationId ?? "")
      const msg: Message = {
        id: String(obj.id ?? obj.Id ?? crypto.randomUUID()),
        senderId: String(obj.senderId ?? obj.SenderId ?? ""),
        receiverId: String(obj.receiverId ?? obj.ReceiverId ?? ""),
        messageText: String(obj.messageText ?? obj.MessageText ?? ""),
        sentAt: String(obj.sentAt ?? obj.SentAt ?? new Date().toISOString()),
        isRead: Boolean(obj.isRead ?? obj.IsRead ?? false),
        conversationId: incomingConversationId,
      }
      setMessages((prev) => {
        if (
          !selectedConversationIdRef.current ||
          selectedConversationIdRef.current !== incomingConversationId
        )
          return prev
        if (prev.some((m) => m.id === msg.id)) return prev
        return sortMessagesAsc([...prev, msg])
      })
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === incomingConversationId)
        if (idx < 0) return prev
        const next = [...prev]
        const conv = next[idx]
        const isCurrent = selectedConversationIdRef.current === incomingConversationId
        next[idx] = { ...conv, unreadCount: isCurrent ? 0 : (conv.unreadCount ?? 0) + 1 }
        return next
      })
    })

    conn.start().then(() => setRealtimeConnected(true)).catch(() => setRealtimeConnected(false))

    return () => {
      const c = hubRef.current
      hubRef.current = null
      c?.stop().catch(() => {})
    }
  }, [currentUserId])

  useEffect(() => {
    const conn = hubRef.current
    const currentConversationId = selected?.id ?? null
    if (!conn || conn.state !== HubConnectionState.Connected) return
    const sync = async () => {
      const previous = lastJoinedConversationIdRef.current
      if (previous && previous !== currentConversationId) {
        await conn.invoke("LeaveConversation", previous).catch(() => {})
      }
      if (currentConversationId && previous !== currentConversationId) {
        await conn.invoke("JoinConversation", currentConversationId).catch(() => {})
      }
      lastJoinedConversationIdRef.current = currentConversationId
    }
    void sync()
  }, [selected, realtimeConnected])

  const startConversationWithUser = useCallback(
    async (user: ProfileViewerUser) => {
      if (!user.id) return
      const existing = existingConversationByUserId.get(user.id)
      if (existing) { setSelected(existing); return }
      setStartingConversationWith(user.id)
      try {
        await chatApi.createConversation(user.id)
        const fresh = await chatApi.getConversations()
        setConversations(fresh)
        setPartnerNames((p) => ({ ...p, [user.id]: profileViewerDisplayName(user) }))
        setPartnerAvatars((p) => ({
          ...p,
          [user.id]: resolveProfileMediaUrl(user.profilePicture) ?? AVATAR_PLACEHOLDER_SMALL,
        }))
        const created = fresh.find((c) => getOtherUserId(c) === user.id) ?? null
        if (created) setSelected(created)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not start conversation.")
      } finally {
        setStartingConversationWith(null)
      }
    },
    [existingConversationByUserId, getOtherUserId]
  )

  const handleSend = useCallback(async () => {
    if (!selected || !newMessage.trim() || sending) return
    if (threadBlocked) {
      toast.error("You can only message users you are matched with.")
      return
    }
    const otherId = getOtherUserId(selected)
    setSending(true)
    try {
      await chatApi.sendMessage(otherId, newMessage.trim())
      setNewMessage("")
      await loadMessages(selected)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Message could not be sent.")
    } finally {
      setSending(false)
    }
  }, [selected, newMessage, sending, getOtherUserId, loadMessages, threadBlocked])

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    )
  }

  const selectedOtherId = selected ? getOtherUserId(selected) : null
  const selectedName = selectedOtherId ? partnerNames[selectedOtherId] ?? "User" : ""
  const selectedAvatar = selectedOtherId
    ? partnerAvatars[selectedOtherId] ?? AVATAR_PLACEHOLDER_SMALL
    : AVATAR_PLACEHOLDER_SMALL

  const query = searchQuery.trim().toLowerCase()
  const filteredConversations = conversations.filter((conv) => {
    if (!query) return true
    const otherId = getOtherUserId(conv)
    return (partnerNames[otherId] ?? "User").toLowerCase().includes(query)
  })
  const filteredMatchedUsers = matchedUsers.filter((u) => {
    if (!query) return true
    return profileViewerDisplayName(u).toLowerCase().includes(query)
  })

  return (
    <AuthenticatedShell sidebarInsetClassName="flex flex-col overflow-hidden">
      {/* Two-panel messenger layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: Conversation list ─────────────────────────── */}
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r bg-background">

          {/* Search */}
          <div className="shrink-0 px-3 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm h-9 bg-muted/40 border-transparent focus-visible:border-input focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Matches strip */}
          {(matchedLoading || filteredMatchedUsers.length > 0) && (
            <>
              <div className="shrink-0 flex items-center gap-1.5 px-4 pb-2">
                <Sparkles className="size-3 text-pink-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Matches
                </span>
              </div>
              <div className="shrink-0 flex gap-3.5 overflow-x-auto px-4 pb-3 scrollbar-none">
                {matchedLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="size-11 shrink-0 rounded-full bg-muted animate-pulse ring-2 ring-pink-500/20" />
                        <div className="h-2 w-8 rounded bg-muted animate-pulse" />
                      </div>
                    ))
                  : filteredMatchedUsers.slice(0, 12).map((u) => {
                      const name = profileViewerDisplayName(u)
                      const avatar = resolveProfileMediaUrl(u.profilePicture)
                      const isStarting = startingConversationWith === u.id
                      const hasConvo = existingConversationByUserId.has(u.id)
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => void startConversationWithUser(u)}
                          disabled={isStarting}
                          className="flex flex-col items-center gap-1.5 outline-none disabled:opacity-50"
                        >
                          <div className="relative size-11 shrink-0">
                            <div
                              className={cn(
                                "absolute inset-0 rounded-full",
                                !hasConvo
                                  ? "bg-linear-to-br from-pink-500 to-rose-400 p-[2px]"
                                  : "bg-muted p-[2px]"
                              )}
                            >
                              <div className="size-full rounded-full overflow-hidden bg-background">
                                <Avatar className="size-full">
                                  <AvatarImage src={avatar ?? undefined} alt={name} />
                                  <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                            {isStarting && (
                              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                                <Loader2 className="size-3 animate-spin" />
                              </span>
                            )}
                            {!hasConvo && !isStarting && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-pink-500 ring-2 ring-background">
                                <UserPlus className="size-2.5 text-white" />
                              </span>
                            )}
                          </div>
                          <span className="max-w-[44px] truncate text-[10px] text-muted-foreground">
                            {name.split(" ")[0]}
                          </span>
                        </button>
                      )
                    })}
              </div>
              <Separator />
            </>
          )}

          {/* Conversation list — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-1 p-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <div className="size-10 shrink-0 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                      <div className="h-2.5 w-4/5 rounded bg-muted/70 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                  <MessageCircle className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {conversations.length === 0 ? "No conversations yet" : "No results found"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {filteredConversations.map((conv) => {
                  const otherId = getOtherUserId(conv)
                  const name = partnerNames[otherId] ?? "User"
                  const avatar = partnerAvatars[otherId] ?? AVATAR_PLACEHOLDER_SMALL
                  const unread = conv.unreadCount ?? 0
                  const isSelected = selected?.id === conv.id
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelected(conv)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <Avatar className="size-10 shrink-0">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={cn(
                              "truncate text-sm",
                              unread > 0 ? "font-semibold" : "font-medium",
                              isSelected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {name}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {formatTime(conv.createdAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "truncate text-xs",
                            isSelected ? "text-primary/70" : "text-muted-foreground"
                          )}
                        >
                          {unread > 0
                            ? `${unread} new message${unread > 1 ? "s" : ""}`
                            : "Tap to open"}
                        </p>
                      </div>
                      {unread > 0 && (
                        <Badge className="shrink-0 size-5 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold">
                          {unread > 9 ? "9+" : unread}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── Right: Chat panel ──────────────────────────────── */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Chat header */}
              <div className="shrink-0 flex items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-5 py-3">
                <Avatar className="size-9">
                  <AvatarImage src={selectedAvatar} alt={selectedName} />
                  <AvatarFallback className="text-xs">{getInitials(selectedName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{selectedName}</p>
                    <Badge
                      variant="secondary"
                      className="shrink-0 gap-1 text-[10px] px-1.5 py-0 h-4 border-pink-500/20 bg-pink-500/8 text-pink-700 dark:text-pink-400"
                    >
                      <Sparkles className="size-2.5" />
                      Match
                    </Badge>
                  </div>
                  <Link
                    href={`/users/${selectedOtherId}`}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    View profile
                  </Link>
                </div>
                {!realtimeConnected && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    <WifiOff className="size-3.5" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>

              {/* Messages area */}
              <div
                ref={messagesPanelRef}
                className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-1.5"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 40% at 50% 0%, oklch(0.7 0.08 250 / 0.04), transparent 60%)",
                }}
              >
                {threadBlocked && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Messaging is limited to mutual matches. If you just matched, try again in a
                      moment.
                    </AlertDescription>
                  </Alert>
                )}

                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center py-20">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="rounded-full bg-muted p-4">
                      <MessageCircle className="size-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Start the conversation</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Say something nice to {selectedName}!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = String(msg.senderId) === String(currentUserId)
                    const prevMsg = messages[i - 1]
                    const showAvatar =
                      !isMe &&
                      (!prevMsg || String(prevMsg.senderId) === String(currentUserId))
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}
                      >
                        {!isMe && (
                          <div className="size-6 shrink-0 mb-0.5">
                            {showAvatar && (
                              <Avatar className="size-6">
                                <AvatarImage src={selectedAvatar} alt={selectedName} />
                                <AvatarFallback className="text-[9px]">
                                  {getInitials(selectedName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        <div className={cn("flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}>
                          <div
                            className={cn(
                              "max-w-xs rounded-2xl px-3.5 py-2 text-sm leading-relaxed lg:max-w-md",
                              isMe
                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                : "rounded-bl-sm bg-muted text-foreground"
                            )}
                          >
                            {msg.messageText}
                          </div>
                          <span className="px-1 text-[10px] text-muted-foreground tabular-nums">
                            {formatTime(msg.sentAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="shrink-0 border-t bg-background px-5 py-3">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => { e.preventDefault(); void handleSend() }}
                >
                  <Input
                    placeholder={threadBlocked ? "Messaging unavailable" : `Message ${selectedName}…`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending || threadBlocked}
                    className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:border-input focus-visible:bg-background"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 rounded-full"
                    disabled={!newMessage.trim() || sending || threadBlocked}
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
              <div
                className="rounded-full p-6 ring-1 ring-border"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, oklch(0.7 0.08 250 / 0.08), transparent 70%)",
                }}
              >
                <MessageCircle className="size-10 text-muted-foreground/60" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Your conversations</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {conversations.length === 0
                    ? "Match with someone from Browse to start chatting"
                    : "Select a conversation from the list"}
                </p>
              </div>
              {conversations.length === 0 && (
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href="/browse">Browse people</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedShell>
  )
}
