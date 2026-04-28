"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  profileApi,
  getUserIdFromToken,
  resolveProfileMediaUrl,
  profileViewerDisplayName,
  type AppUser,
  type ProfileViewerUser,
} from "@/lib/services/profile-api"

export function useMyProfile() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [profileViews, setProfileViews] = useState<ProfileViewerUser[]>([])
  const [profileLikes, setProfileLikes] = useState<ProfileViewerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userId = getUserIdFromToken()

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    try {
      const data = await profileApi.getUser(userId)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    }
  }, [userId])

  const fetchActivity = useCallback(async () => {
    if (!userId) return
    try {
      const [views, likes] = await Promise.all([
        profileApi.getProfileViews().catch(() => []),
        profileApi.getProfileLikes().catch(() => []),
      ])
      setProfileViews(Array.isArray(views) ? views : [])
      setProfileLikes(Array.isArray(likes) ? likes : [])
    } catch {
      // ignore
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setError("Not authenticated")
      return
    }
    let cancelled = false
    async function init() {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([fetchProfile(), fetchActivity()])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [userId, fetchProfile, fetchActivity])

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    try {
      await profileApi.uploadImage(file)
      await fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleSetMainPhoto = async (photoId: string) => {
    if (!userId) return
    try {
      await profileApi.setMainPhoto(photoId, userId)
      await fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set main photo")
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!userId) return
    try {
      await profileApi.deletePhoto(photoId)
      await fetchProfile()
      setSelectedPhotoIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo")
    }
  }

  const activity = [
    ...profileLikes.slice(0, 5).map((p, i) => ({
      id: `like-${i}`,
      type: "like" as const,
      user: profileViewerDisplayName(p),
      action: "liked your profile",
      time: "",
      avatar: resolveProfileMediaUrl(p.profilePicture),
    })),
    ...profileViews.slice(0, 5).map((p, i) => ({
      id: `view-${i}`,
      type: "view" as const,
      user: profileViewerDisplayName(p),
      action: "viewed your profile",
      time: "",
      avatar: resolveProfileMediaUrl(p.profilePicture),
    })),
  ]

  return {
    user,
    profileViews,
    profileLikes,
    loading,
    error,
    isEditing,
    setIsEditing,
    selectedPhotoIndex,
    setSelectedPhotoIndex,
    uploading,
    fileInputRef,
    userId,
    fetchProfile,
    handleUploadPhoto,
    handleSetMainPhoto,
    handleDeletePhoto,
    activity,
  }
}
