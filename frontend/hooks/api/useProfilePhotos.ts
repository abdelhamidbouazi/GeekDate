"use client"

import { useCallback, useState } from "react"
import { ApiError } from "@/lib/api/client"
import { settingsApi, type UploadedPhotoDto } from "@/lib/api/settings"

function getMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return "Request failed"
}
export function useProfilePhotos() {
  const [pendingPhotoId, setPendingPhotoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPhoto = useCallback(async (file: File): Promise<UploadedPhotoDto> => {
    setUploading(true)
    setError(null)
    try {
      return await settingsApi.uploadPhoto(file)
    } catch (err) {
      const message = getMessage(err)
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  const deletePhoto = useCallback(async (photoId: string) => {
    setPendingPhotoId(photoId)
    setError(null)
    try {
      await settingsApi.deletePhoto(photoId)
    } catch (err) {
      const message = getMessage(err)
      setError(message)
      throw err
    } finally {
      setPendingPhotoId(null)
    }
  }, [])

  const setMainPhoto = useCallback(async (photoId: string) => {
    setPendingPhotoId(photoId)
    setError(null)
    try {
      await settingsApi.setMainPhoto(photoId)
    } catch (err) {
      const message = getMessage(err)
      setError(message)
      throw err
    } finally {
      setPendingPhotoId(null)
    }
  }, [])

  return {
    uploading,
    pendingPhotoId,
    error,
    uploadPhoto,
    deletePhoto,
    setMainPhoto,
    clearError: () => setError(null),
  }
}
