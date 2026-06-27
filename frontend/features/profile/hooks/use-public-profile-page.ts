"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  profileApi,
  getUserIdFromToken,
  type AppUser,
  type UserLikeInfo,
} from "@/lib/services/profile-api"
import { browseApi } from "@/lib/services/browse-api"
import { chatApi } from "@/lib/services/chat-api"
import {
  computeCompatibility,
  mapAppUserToUserProfile,
} from "@/lib/utils/profile-view"
import type { CompatibilityPreview, UserProfile } from "@/types/profile"

export function usePublicProfilePage(userId: string) {
  const router = useRouter()
  const currentUserId = getUserIdFromToken()

  const [user, setUser] = useState<AppUser | null>(null)
  const [likeInfo, setLikeInfo] = useState<UserLikeInfo | null>(null)
  const [myUser, setMyUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [compatibility, setCompatibility] = useState<CompatibilityPreview | null>(
    null
  )

  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [profileData, likeData] = await Promise.all([
        profileApi.getUser(userId),
        profileApi.getUserLikeInfo(userId).catch(() => null),
      ])
      setUser({ ...profileData, id: userId })
      setLikeInfo(likeData)
      setLiked(likeData?.isLikedByMe ?? false)

      if (currentUserId && currentUserId !== userId) {
        profileApi.markProfileViewed(userId).catch(() => {})
        const me = await profileApi.getUser(currentUserId).catch(() => null)
        setMyUser(me ? { ...me, id: currentUserId } : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [userId, currentUserId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    async function loadCompatibility() {
      if (!user || !myUser) {
        setCompatibility(null)
        return
      }
      try {
        const interests = await browseApi.getInterests().catch(() => [])
        const interestsMap = new Map(
          interests.map((i) => [i.id ?? i.Id ?? "", i.name ?? i.Name ?? ""])
        )
        const myIds = (myUser.interests ?? []).map((i) => i.interestId)
        const theirIds = (user.interests ?? []).map((i) => i.interestId)
        const { score, sharedTags } = computeCompatibility(
          myIds,
          theirIds,
          interestsMap
        )
        setCompatibility({
          score,
          sharedTags,
          label:
            score >= 75
              ? "Strong match potential"
              : score >= 50
                ? "Good match potential"
                : "Some shared interests",
        })
      } catch {
        setCompatibility(null)
      }
    }
    loadCompatibility()
  }, [user, myUser])

  const profile: UserProfile | null = useMemo(() => {
    if (!user) return null
    return mapAppUserToUserProfile(user)
  }, [user])

  const handleLike = useCallback(async () => {
    if (!userId || actionLoading) return
    if (currentUserId === userId) {
      toast.error("You cannot like your own profile.")
      return
    }
    const hasProfilePicture = Boolean(
      myUser?.photoProfileUrl || myUser?.photos?.some((photo) => photo.isMain)
    )
    if (!hasProfilePicture) {
      toast.error("Add a profile picture before liking profiles.")
      return
    }
    setActionLoading(true)
    try {
      await browseApi.likeProfile(userId)
      setLiked(true)
      const nextLikeInfo = await profileApi.getUserLikeInfo(userId).catch(() => null)
      setLikeInfo(nextLikeInfo)
      toast.success("Sent them a like")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send like")
    } finally {
      setActionLoading(false)
    }
  }, [userId, actionLoading, currentUserId, myUser])

  const handleUnlike = useCallback(async () => {
    if (!userId || actionLoading) return
    if (currentUserId === userId) {
      toast.error("You cannot unlike your own profile.")
      return
    }
    setActionLoading(true)
    try {
      await browseApi.unlikeProfile(userId)
      setLiked(false)
      const nextLikeInfo = await profileApi.getUserLikeInfo(userId).catch(() => null)
      setLikeInfo(nextLikeInfo)
      toast.success("Like removed")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not remove like"
      if (/not liked|failed to unlike/i.test(message)) {
        setLiked(false)
        toast.info("This profile was not liked.")
      } else {
        toast.error(message)
      }
    } finally {
      setActionLoading(false)
    }
  }, [userId, actionLoading, currentUserId])

  const handleMessage = useCallback(async () => {
    if (!userId || actionLoading) return
    setActionLoading(true)
    try {
      await chatApi.createConversation(userId)
      router.push("/messages")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not start conversation. You may need to match first."
      )
    } finally {
      setActionLoading(false)
    }
  }, [userId, actionLoading, router])

  const handleBlock = useCallback(async () => {
    if (!userId || actionLoading) return
    if (!confirm("Block this user? You won't see each other.")) return
    setActionLoading(true)
    try {
      await profileApi.blockProfile(userId)
      toast.success("User blocked")
      router.push("/browse")
    } catch {
      toast.error("Could not block user")
    } finally {
      setActionLoading(false)
    }
  }, [userId, actionLoading, router])

  const showActions = Boolean(currentUserId && currentUserId !== userId)

  return {
    profile,
    compatibility,
    loading,
    error,
    liked,
    actionLoading,
    showActions,
    isMatched: likeInfo?.isMatched ?? false,
    likedByThem: likeInfo?.isLikedByThem ?? false,
    currentUserHasProfilePicture: Boolean(
      myUser?.photoProfileUrl || myUser?.photos?.some((photo) => photo.isMain)
    ),
    onRetry: fetchData,
    onLike: handleLike,
    onUnlike: handleUnlike,
    onMessage: handleMessage,
    onBlock: handleBlock,
  }
}
