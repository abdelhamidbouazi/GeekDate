"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { ProfileSummaryCard } from "@/features/matches/components/profile-summary-card"
import { Button } from "@/components/ui/button"
import { browseApi } from "@/lib/services/browse-api"
import { profileApi, type ProfileSummaryUser } from "@/lib/services/profile-api"
import { cn } from "@/lib/utils"
import { Heart, Loader2, ThumbsUp, X } from "lucide-react"
import { toast } from "sonner"

type LikesTab = "received" | "given"

function LikesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = (searchParams.get("tab") === "given" ? "given" : "received") as LikesTab

  const [profiles, setProfiles] = useState<ProfileSummaryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setTab = (next: LikesTab) => {
    router.replace(next === "given" ? "/likes?tab=given" : "/likes?tab=received")
  }

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data =
        tab === "given"
          ? await profileApi.getLikesGiven()
          : await profileApi.getLikesReceived()
      setProfiles(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load likes")
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleLikeBack = async (userId: string) => {
    setBusyId(userId)
    try {
      await browseApi.likeProfile(userId)
      toast.success("It's a match if they liked you too!")
      await fetchProfiles()
    } catch {
      toast.error("Could not send like — try again.")
    } finally {
      setBusyId(null)
    }
  }

  const handleUnlike = async (userId: string) => {
    setBusyId(userId)
    try {
      await browseApi.unlikeProfile(userId)
      toast.success("Removed your like")
      await fetchProfiles()
    } catch {
      toast.error("Could not remove like — try again.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AuthenticatedShell>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-6 flex items-center gap-3 rounded-[2rem] border border-primary/10 bg-linear-to-br from-card via-card to-amber-500/8 p-6 shadow-xl shadow-amber-950/5">
                <div className="rounded-full bg-linear-to-br from-amber-500 to-orange-400 p-3 text-white shadow-lg shadow-amber-500/25">
                  <ThumbsUp className="size-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Likes</h1>
                  <p className="text-muted-foreground">
                    See who liked you and profiles you have liked.
                  </p>
                </div>
              </div>

              <div className="mb-6 flex gap-2 rounded-xl border border-border/60 bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setTab("received")}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    tab === "received"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Liked me
                </button>
                <button
                  type="button"
                  onClick={() => setTab("given")}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    tab === "given"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  I liked
                </button>
              </div>

              {error && <p className="text-destructive mb-4">{error}</p>}

              {loading && profiles.length === 0 ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {profiles.map((profile, index) => (
                    <ProfileSummaryCard
                      key={profile.id}
                      profile={profile}
                      index={index}
                      accent="amber"
                      busy={busyId === profile.id}
                      subtitle={
                        tab === "received"
                          ? "They liked your profile — like back to match."
                          : "You liked this profile. Waiting for them to like back."
                      }
                      badge={
                        <span className="rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                          {tab === "received" ? "Liked you" : "You liked"}
                        </span>
                      }
                      actions={
                        <>
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link href={`/users/${profile.id}`}>View profile</Link>
                          </Button>
                          {tab === "received" ? (
                            <Button
                              size="sm"
                              className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                              disabled={busyId === profile.id}
                              onClick={() => handleLikeBack(profile.id)}
                            >
                              <Heart className="mr-2 size-4" />
                              Like back
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              disabled={busyId === profile.id}
                              onClick={() => handleUnlike(profile.id)}
                            >
                              <X className="mr-2 size-4" />
                              Unlike
                            </Button>
                          )}
                        </>
                      }
                    />
                  ))}
                </div>
              )}

              {!loading && profiles.length === 0 && (
                <p className="text-muted-foreground py-12 text-center">
                  {tab === "received"
                    ? "No one has liked you yet. Keep browsing to get noticed!"
                    : "You haven't liked anyone yet. Explore Browse to find people."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}

export default function LikesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LikesContent />
    </Suspense>
  )
}
