"use client"

import { chatApi } from "@/lib/services/chat-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useConversations() {
  return useAsyncQuery(() => chatApi.getConversations())
}
