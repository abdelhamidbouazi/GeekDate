"use client"

import { profileApi } from "@/lib/services/profile-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useMatches() {
  return useAsyncQuery(() => profileApi.getMatches())
}
