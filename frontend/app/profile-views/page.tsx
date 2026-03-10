"use client"

import { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Eye, Heart, MessageCircle, Clock, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { profileApi, type UserProfileView } from "@/lib/profile-api"
import { browseApi } from "@/lib/browse-api"

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23999' width='400' height='600'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3ENo photo%3C/text%3E%3C/svg%3E"

function ProfileViewCard({
  view,
  onLike,
}: {
  view: UserProfileView
  onLike: (id: string) => void
}) {
  const name =
    [view.firstName, view.lastName].filter(Boolean).join(" ") ||
    view.userName ||
    "User"
  return (
    <article className="group relative rounded-2xl overflow-hidden bg-card/50 dark:bg-card/40 border border-border/30 dark:border-border/20 backdrop-blur-sm transition-all duration-300 hover:border-border/60 dark:hover:border-border/40 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={view.pictureUrl ?? PLACEHOLDER}
          alt={`${name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={(view.pictureUrl ?? "").startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {view.age != null && (
                <span className="text-lg text-white/80">{view.age}</span>
              )}
            </div>
            <p className="text-sm font-medium text-white/90">Member</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>Viewed your profile</span>
        </div>
        {view.id && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/users/${view.id}`}>
                <MessageCircle className="size-4 mr-2" />
                Message
              </Link>
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onLike(view.id!)}
            >
              <Heart className="size-4 mr-2" />
              Like
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}

export default function ProfileViewsPage() {
  const [views, setViews] = useState<UserProfileView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchViews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileApi.getProfileViews()
      setViews(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile views")
      setViews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchViews()
  }, [fetchViews])

  const handleLike = useCallback((userId: string) => {
    browseApi.likeProfile(userId).then(() => fetchViews()).catch(() => {})
  }, [fetchViews])

  if (loading && views.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-purple-500/10 p-3">
                    <Eye className="size-6 text-purple-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Profile Views
                    </h1>
                    <p className="text-muted-foreground">
                      See who&apos;s been checking out your profile.
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-destructive mb-4">{error}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {views.map((view) => (
                    <ProfileViewCard
                      key={view.userName}
                      view={view}
                      onLike={handleLike}
                    />
                  ))}
                </div>

                {views.length === 0 && !loading && (
                  <p className="text-muted-foreground py-12 text-center">
                    No profile views yet. Your viewers will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
