"use client"

import { notificationApi } from "@/lib/services/notification-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useNotifications() {
  return useAsyncQuery(() => notificationApi.getUnread())
}
