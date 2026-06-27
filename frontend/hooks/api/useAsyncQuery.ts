"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface AsyncQueryState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<T | null>
}

export function useAsyncQuery<T>(
  loader: () => Promise<T>
): AsyncQueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await loaderRef.current()
      setData(next)
      return next
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Request failed")
      setError(nextError)
      setData(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
