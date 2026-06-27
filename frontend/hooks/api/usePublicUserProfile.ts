"use client"

import { profileApi } from "@/lib/services/profile-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function usePublicUserProfile(userId: string | null | undefined) {
  return useAsyncQuery(() => {
    if (!userId) throw new Error("User id is required.")
    return profileApi.getUser(userId)
  })
}
