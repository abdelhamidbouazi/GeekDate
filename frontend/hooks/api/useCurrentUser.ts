"use client"

import { profileApi } from "@/lib/services/profile-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useCurrentUser() {
  return useAsyncQuery(() => profileApi.getMe())
}
