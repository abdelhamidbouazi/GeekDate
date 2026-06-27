"use client"

import { useState } from "react"
import { browseApi } from "@/lib/services/browse-api"

export function useLikeActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function like(userId: string) {
    setLoading(true)
    setError(null)
    try {
      await browseApi.likeProfile(userId)
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to like profile")
      setError(nextError)
      throw nextError
    } finally {
      setLoading(false)
    }
  }

  async function unlike(userId: string) {
    setLoading(true)
    setError(null)
    try {
      await browseApi.unlikeProfile(userId)
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to unlike profile")
      setError(nextError)
      throw nextError
    } finally {
      setLoading(false)
    }
  }

  return { like, unlike, loading, error }
}

