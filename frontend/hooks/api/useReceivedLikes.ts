"use client"

import { profileApi } from "@/lib/services/profile-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useReceivedLikes() {
  return useAsyncQuery(() => profileApi.getLikesReceived())
}
