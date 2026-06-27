"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  profileApi,
  getUserIdFromToken,
  type AppUser,
} from "@/lib/services/profile-api"
import { browseApi } from "@/lib/services/browse-api"
import {
  computeCompatibility,
  mapAppUserToUserProfile,
} from "@/lib/utils/profile-view"
import type { CompatibilityPreview } from "@/types/profile"
import { useMyProfile } from "@/features/profile/hooks/use-my-profile"

export function useMyProfilePage() {
  const {
    user,
    profileViews,
    profileLikes,
    mutualMatches,
    loading,
    error,
    uploading,
    fetchProfile,
    handleSetMainPhoto,
    handleDeletePhoto,
    activity,
  } = useMyProfile()

  const [compatibility, setCompatibility] = useState<CompatibilityPreview | null>(
    null
  )

  const profile = useMemo(() => {
    if (!user) return null
    return mapAppUserToUserProfile(user, {
      visits: profileViews.length,
      likes: profileLikes.length,
      matches: mutualMatches.length,
    })
  }, [user, profileViews.length, profileLikes.length, mutualMatches.length])

  const loadCompatibilityTeaser = useCallback(async (currentUser: AppUser) => {
    try {
      const [browseUsers, interests] = await Promise.all([
        browseApi.browseUsers().catch(() => []),
        browseApi.getInterests().catch(() => []),
      ])
      const interestsMap = new Map(
        interests.map((i) => [i.id ?? i.Id ?? "", i.name ?? i.Name ?? ""])
      )
      const myIds = (currentUser.interests ?? []).map((i) => i.interestId)
      const top = browseUsers[0]
      if (!top?.interestIds?.length) {
        setCompatibility({
          score: 0,
          sharedTags: [],
          label: "Browse to find matches",
        })
        return
      }
      const { score, sharedTags } = computeCompatibility(
        myIds,
        top.interestIds,
        interestsMap
      )
      setCompatibility({
        score,
        sharedTags,
        label: score >= 75 ? "Strong match potential" : "Good match potential",
      })
    } catch {
      setCompatibility(null)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const timer = window.setTimeout(() => {
      void loadCompatibilityTeaser(user)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [user, loadCompatibilityTeaser])

  const onUpload = useCallback(
    async (file: File) => {
      const userId = getUserIdFromToken()
      if (!userId) return
      try {
        await profileApi.uploadImage(file)
        await fetchProfile()
        toast.success("Photo uploaded")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to upload photo")
      }
    },
    [fetchProfile]
  )

  const onSetMain = useCallback(
    async (photoId: string) => {
      await handleSetMainPhoto(photoId)
      toast.success("Main photo updated")
    },
    [handleSetMainPhoto]
  )

  const onDelete = useCallback(
    async (photoId: string) => {
      await handleDeletePhoto(photoId)
      toast.success("Photo deleted")
    },
    [handleDeletePhoto]
  )

  return {
    profile,
    activity,
    compatibility,
    loading,
    error,
    uploading,
    onRetry: fetchProfile,
    onUpload,
    onSetMain,
    onDelete,
  }
}
