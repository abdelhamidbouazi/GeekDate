"use client"

import { useCallback, useState } from "react"
import { ApiError } from "@/lib/api/client"
import { settingsApi, type UpdateProfilePayload } from "@/lib/api/settings"

type BasicProfilePayload = {
  dateOfBirth?: string | null
  gender: string | number
}

function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err
  return new Error("Request failed")
}

export function useUpdateProfile() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setPending(true)
    setError(null)
    try {
      return await settingsApi.updateProfile(payload)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : normalizeError(err).message
      setError(message)
      throw err
    } finally {
      setPending(false)
    }
  }, [])

  const updateBasicProfile = useCallback(async (payload: BasicProfilePayload) => {
    setPending(true)
    setError(null)
    try {
      const form = new FormData()
      if (payload.dateOfBirth) {
        form.append("DateOfBirth", new Date(payload.dateOfBirth).toISOString())
      }
      form.append("Gender", String(payload.gender))
      return await settingsApi.completeBasicProfile(form)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : normalizeError(err).message
      setError(message)
      throw err
    } finally {
      setPending(false)
    }
  }, [])

  return {
    pending,
    error,
    updateProfile,
    updateBasicProfile,
    clearError: () => setError(null),
  }
}

