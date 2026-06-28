"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr"
import type { HubConnection } from "@microsoft/signalr"
import { getApiOrigin } from "@/lib/api/http"
import { getUserIdFromToken } from "@/lib/services/profile-api"

export function useRealtimeToasts() {
  const pathname = usePathname()
  const hubRef = useRef<HubConnection | null>(null)
  const heartbeatRef = useRef<number | null>(null)

  useEffect(() => {
    // The messages page manages its own hub connection for real-time chat.
    // Starting a second one here would cause false UserOffline events when
    // the messages page unmounts and cleans up its connection.
    if (pathname?.startsWith("/messages")) return

    const userId = getUserIdFromToken()
    if (!userId || typeof window === "undefined") return

    const hubUrl = `${getApiOrigin()}/chatHub`

    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("accessToken") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build()

    hubRef.current = conn

    conn.on("ReceiveNotification", (payload: unknown) => {
      const obj = (payload ?? {}) as Record<string, unknown>
      const message = String(obj.message ?? obj.Message ?? "New notification")
      toast(message, { duration: 5000 })
    })

    conn.start()
      .then(() => {
        // Keep lastActive fresh so profile-page online indicators are accurate
        heartbeatRef.current = window.setInterval(() => {
          if (hubRef.current?.state === HubConnectionState.Connected) {
            void hubRef.current.invoke("Heartbeat").catch(() => {})
          }
        }, 60_000)
      })
      .catch(() => {})

    return () => {
      if (heartbeatRef.current != null) {
        window.clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
      const c = hubRef.current
      hubRef.current = null
      if (c && c.state !== HubConnectionState.Disconnected) {
        c.stop().catch(() => {})
      }
    }
  }, [pathname])
}
