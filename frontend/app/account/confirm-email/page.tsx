"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/auth"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    async function confirm() {
      const userId = searchParams.get("userId")
      const code = searchParams.get("code") ?? searchParams.get("token")
      if (!userId || !code) {
        setStatus("error")
        return
      }
      try {
        await authApi.confirmEmail(userId, code)
        setStatus("success")
        try {
          const res = await authApi.validateToken() as { emailVerified?: boolean; profileCompleted?: boolean }
          if (res?.emailVerified && res?.profileCompleted) {
            router.replace("/browse")
            return
          }
        } catch {
          // No token or invalid - go to verify for profile completion
        }
        router.replace("/verify")
      } catch {
        setStatus("error")
      }
    }
    confirm()
  }, [searchParams, router])

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      {status === "loading" && (
        <p className="text-muted-foreground">Verifying your email...</p>
      )}
      {status === "success" && (
        <p className="text-muted-foreground">Email verified. Redirecting...</p>
      )}
      {status === "error" && (
        <p className="text-destructive">Verification failed. The link may have expired.</p>
      )}
    </div>
  )
}
