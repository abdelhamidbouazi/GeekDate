"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { ProfileSummaryCard } from "@/features/matches/components/profile-summary-card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, MessageCircle } from "lucide-react"
import { profileApi, type ProfileSummaryUser } from "@/lib/services/profile-api"

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<ProfileSummaryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileApi.getMatches()
      setProfiles(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches")
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  if (loading && profiles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <AuthenticatedShell>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-6 flex items-center gap-3 rounded-[2rem] border border-primary/10 bg-linear-to-br from-card via-card to-primary/8 p-6 shadow-xl shadow-rose-950/5">
                <div className="rounded-full bg-linear-to-br from-rose-500 to-orange-400 p-3 text-white shadow-lg shadow-rose-500/25">
                  <Heart className="size-6 fill-current" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">
                    Your Matches
                  </h1>
                  <p className="text-muted-foreground">
                    People who liked you back. Start the conversation while the
                    spark is fresh.
                  </p>
                </div>
              </div>

              {error && <p className="text-destructive mb-4">{error}</p>}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {profiles.map((profile, index) => (
                  <ProfileSummaryCard
                    key={profile.id}
                    profile={profile}
                    index={index}
                    accent="rose"
                    subtitle="You both liked each other — it's a match!"
                    badge={
                      <span className="rounded-full bg-rose-500/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        Match
                      </span>
                    }
                    actions={
                      <>
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/users/${profile.id}`}>View profile</Link>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-linear-to-r from-rose-500 to-orange-400 text-white hover:opacity-90"
                          asChild
                        >
                          <Link href="/messages">
                            <MessageCircle className="mr-2 size-4" />
                            Message
                          </Link>
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>

              {profiles.length === 0 && !loading && (
                <p className="text-muted-foreground py-12 text-center">
                  No mutual matches yet. Like profiles from Browse or respond to
                  likes on the Likes page.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
