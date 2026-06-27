"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Button } from "@/components/ui/button"
import { Eye, Heart, MessageCircle, RefreshCw, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import {
  profileApi,
  profileViewerDisplayName,
  resolveProfileMediaUrl,
  type ProfileViewerUser,
} from "@/lib/services/profile-api"
import { browseApi } from "@/lib/services/browse-api"
import { cn } from "@/lib/utils"

function ProfileViewCard({
  view,
  index,
  busy,
  onLike,
}: {
  view: ProfileViewerUser
  index: number
  busy: boolean
  onLike: (id: string) => void
}) {
  const name = profileViewerDisplayName(view)
  const imageSrc = resolveProfileMediaUrl(view.profilePicture)
  const age =
    view.age != null && view.age > 0 ? view.age : null
  const id = view.id

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-emerald-500/15 bg-card/80 shadow-sm ",
        "opacity-0 animate-fade-in"
      )}
      style={{
        animationDelay: `${Math.min(index, 12) * 55}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex flex-1 flex-col sm:flex-row">
        <div className="relative aspect-[4/5] w-full shrink-0 sm:aspect-auto sm:w-[42%] sm:min-h-[200px]">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 280px"
            unoptimized={
              imageSrc.startsWith("data:") || imageSrc.includes("localhost")
            }
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-transparent sm:to-transparent"
            aria-hidden
          />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
            <Eye className="size-3.5 text-emerald-300" aria-hidden />
            Visitor
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {name}
              </h2>
              {age != null && (
                <span className="text-muted-foreground tabular-nums">{age}</span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Opened your profile
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700/90 dark:text-emerald-400/90">
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              <span>Curiosity is how matches start on SparkDates.</span>
            </div>
          </div>

          {id ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/users/${id}`}>
                  <MessageCircle className="mr-2 size-4" />
                  View profile
                </Link>
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                disabled={busy}
                onClick={() => onLike(id)}
              >
                <Heart className="mr-2 size-4" />
                Like back
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ProfileViewsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-muted/30 sm:flex-row"
        >
          <div className="aspect-[4/5] w-full animate-pulse bg-muted sm:w-[42%] sm:min-h-[200px]" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted/80" />
            <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted/80" />
            <div className="mt-auto flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
              <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfileViewsPage() {
  const [views, setViews] = useState<ProfileViewerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchViews = useCallback(async () => {
    setError(null)
    try {
      const data = await profileApi.getProfileViews()
      setViews(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile views")
      setViews([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      await fetchViews()
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [fetchViews])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchViews()
    } finally {
      setRefreshing(false)
    }
  }, [fetchViews])

  const handleLike = useCallback(
    async (userId: string) => {
      setLikeBusy(true)
      try {
        await browseApi.likeProfile(userId)
        toast.success("Sent them a like")
        await fetchViews()
      } catch {
        toast.error("Could not send like — try again.")
      } finally {
        setLikeBusy(false)
      }
    },
    [fetchViews]
  )

  return (
    <AuthenticatedShell>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="relative flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.45] dark:opacity-[0.28]"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 15% 20%, oklch(0.72 0.12 165 / 0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 10%, oklch(0.75 0.08 200 / 0.25), transparent 50%)",
                }}
                aria-hidden
              />

              <div className="relative px-4 lg:px-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-emerald-500/12 p-3.5 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:ring-emerald-400/15">
                      <Eye className="size-7 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        Profile views
                      </h1>
                      <p className="mt-1 max-w-xl text-muted-foreground">
                        People who stopped on your profile — your signal that
                        you&apos;re showing up in the community.
                      </p>
                      {!loading && (
                        <p className="mt-3 text-sm font-medium text-foreground">
                          <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                            {views.length}
                          </span>{" "}
                          <span className="font-normal text-muted-foreground">
                            {views.length === 1 ? "viewer" : "viewers"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2 border-emerald-500/25 bg-background/60 backdrop-blur-sm"
                    onClick={() => void handleRefresh()}
                    disabled={loading || refreshing}
                  >
                    <RefreshCw
                      className={cn("size-4", refreshing && "animate-spin")}
                    />
                    Refresh
                  </Button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                {loading && views.length === 0 ? (
                  <ProfileViewsSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {views.map((view, index) => (
                      <ProfileViewCard
                        key={view.id}
                        view={view}
                        index={index}
                        busy={likeBusy}
                        onLike={handleLike}
                      />
                    ))}
                  </div>
                )}

                {!loading && views.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/25 bg-emerald-500/[0.03] px-6 py-16 text-center dark:border-emerald-400/20 dark:bg-emerald-400/[0.04]">
                    <div className="mb-4 rounded-full bg-emerald-500/10 p-4 dark:bg-emerald-400/10">
                      <Eye className="size-10 text-emerald-600/80 dark:text-emerald-400/90" />
                    </div>
                    <h2 className="text-lg font-semibold">No views yet</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Stay active, complete your profile, and browse — when
                      someone checks you out, they&apos;ll land here.
                    </p>
                    <Button className="mt-6" asChild variant="default">
                      <Link href="/browse">Discover people</Link>
                    </Button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
    </AuthenticatedShell>
  )
}
