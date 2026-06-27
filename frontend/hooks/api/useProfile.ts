"use client"

import { profileApi } from "@/lib/services/profile-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useProfile() {
  return useAsyncQuery(() => profileApi.getConnectedProfile())
}
