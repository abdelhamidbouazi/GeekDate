"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { setAuthCookie } from "@/lib/auth-cookie"

type ImpersonateResponse = {
  userId: string
  userName: string
  email: string
  token: string
  resetPasswordUrl: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function AdminPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [devSecret, setDevSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ImpersonateResponse | null>(null)

  const canSubmit = useMemo(
    () => identifier.trim().length > 0 && devSecret.trim().length > 0 && !loading,
    [identifier, devSecret, loading]
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/dev/impersonate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Dev-Secret": devSecret.trim(),
        },
        body: JSON.stringify({ identifier: identifier.trim() }),
      })

      const text = await res.text()
      if (!res.ok) {
        let message = `Request failed (${res.status})`
        try {
          const json = JSON.parse(text) as { message?: string }
          if (json?.message) message = json.message
        } catch {
          if (text?.trim()) message = text
        }
        throw new Error(message)
      }

      const data = JSON.parse(text) as ImpersonateResponse
      setResult(data)

      if (data?.token) {
        localStorage.setItem("accessToken", data.token)
        setAuthCookie()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to impersonate user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Admin (Dev)</CardTitle>
            <CardDescription>
              Dev-only: impersonate a user and get a JWT + reset-password link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <FieldGroup>
                {error && <p className="text-sm text-destructive">{error}</p>}

                <Field>
                  <FieldLabel htmlFor="identifier">Username or Email</FieldLabel>
                  <Input
                    id="identifier"
                    placeholder="user42 or user42@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="devSecret">Dev Secret</FieldLabel>
                  <Input
                    id="devSecret"
                    type="password"
                    placeholder="DEV_IMPERSONATE_SECRET"
                    value={devSecret}
                    onChange={(e) => setDevSecret(e.target.value)}
                    required
                  />
                  <FieldDescription>
                    Matches backend `DEV_IMPERSONATE_SECRET`. Only works in Development.
                  </FieldDescription>
                </Field>

                <div className="flex gap-2">
                  <Button type="submit" disabled={!canSubmit} className="flex-1">
                    {loading ? "Impersonating..." : "Impersonate"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/browse")}
                  >
                    Go to browse
                  </Button>
                </div>
              </FieldGroup>

              {result && (
                <div className="rounded-lg border bg-background p-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">User:</span>{" "}
                      {result.userName} ({result.email})
                    </div>
                    <div className="break-all">
                      <span className="font-medium">JWT:</span> {result.token}
                    </div>
                    <div className="break-all">
                      <span className="font-medium">Reset link:</span>{" "}
                      <a className="underline" href={result.resetPasswordUrl} target="_blank" rel="noreferrer">
                        {result.resetPasswordUrl}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(result.token)}
                      >
                        Copy JWT
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(result.resetPasswordUrl)}
                      >
                        Copy reset link
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => router.push("/browse")}
                      >
                        Browse as this user
                      </Button>
                      <Button type="button" size="sm" variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          This page is for local development only.
        </p>
      </div>
    </div>
  )
}

