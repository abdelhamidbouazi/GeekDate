"use client"

import { useAsyncQuery } from "./useAsyncQuery"
import { profileApi } from "@/lib/services/profile-api"

export function useProfilePhotos(userId: string | null | undefined) {
  return useAsyncQuery(async () => {
    if (!userId) return []
    const user = await profileApi.getUser(userId)
    return user.photos ?? []
  })
}
