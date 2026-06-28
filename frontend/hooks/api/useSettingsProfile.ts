"use client"

import { useAsyncQuery } from "./useAsyncQuery"
import { browseApi } from "@/lib/services/browse-api"
import { settingsApi, type ConnectedUserProfile } from "@/lib/api/settings"

export interface SettingsSnapshot {
  profile: ConnectedUserProfile
  interests: Awaited<ReturnType<typeof browseApi.getInterests>>
}

export function useSettingsProfile() {
  return useAsyncQuery<SettingsSnapshot>(async () => {
    const [profile, interests] = await Promise.all([
      settingsApi.getConnectedProfile(),
      browseApi.getInterests(),
    ])
    return { profile, interests }
  })
}

