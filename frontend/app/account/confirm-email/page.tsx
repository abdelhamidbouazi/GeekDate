"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/auth"

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [needsLogin, setNeedsLogin] = useState(false)

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
        const hasSession =
          typeof window !== "undefined" &&
          Boolean(localStorage.getItem("accessToken"))

        if (hasSession) {
          sessionStorage.setItem("emailJustVerified", "1")
          router.replace("/verify")
          return
        }

        setNeedsLogin(true)
        setStatus("success")
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
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">Email verified successfully.</p>
          {needsLogin ? (
            <>
              <p className="text-muted-foreground text-sm">
                Sign in to continue setting up your profile.
              </p>
              <Link href="/login" className="text-primary underline underline-offset-4">
                Go to login
              </Link>
            </>
          ) : null}
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">Verification failed. The link may have expired.</p>
          <Link href="/login" className="text-primary underline underline-offset-4">
            Back to login
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="bg-muted flex min-h-svh items-center justify-center p-6"><p className="text-muted-foreground">Loading...</p></div>}>
      <ConfirmEmailContent />
    </Suspense>
  )
}
