"use client"

import { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { UserCard } from "@/components/user-card"
import { Heart, Loader2 } from "lucide-react"
import { profileApi } from "@/lib/profile-api"

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23999' width='400' height='600'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3ENo photo%3C/text%3E%3C/svg%3E"

function mapProfileLikeToCard(p: {
  userName: string;
  pictureUrl: string | null;
  firstName?: string;
  lastName?: string;
  age?: number;
}) {
  const name =
    [p.firstName, p.lastName].filter(Boolean).join(" ") || p.userName || "User"
  return {
    id: p.userName,
    name,
    age: p.age ?? 0,
    role: "Member",
    location: "Match",
    image: p.pictureUrl ?? PLACEHOLDER_IMAGE,
    tags: [],
    bio: "",
    match: 100,
    online: false,
    fameRating: 0,
  }
}

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<
    ReturnType<typeof mapProfileLikeToCard>[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileApi.getProfileLikes()
      const list = Array.isArray(data) ? data : []
      setProfiles(list.map(mapProfileLikeToCard))
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
                  <div className="rounded-full bg-pink-500/10 p-3">
                    <Heart className="size-6 text-pink-500 fill-pink-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Your Matches
                    </h1>
                    <p className="text-muted-foreground">
                      People who liked you. Start a conversation!
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-destructive mb-4">{error}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {profiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="opacity-0 animate-fade-in"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <UserCard
                        id={profile.id}
                        name={profile.name}
                        age={profile.age}
                        role={profile.role}
                        location={profile.location}
                        image={profile.image}
                        tags={profile.tags}
                        bio={profile.bio}
                        match={profile.match}
                        online={profile.online}
                        fameRating={profile.fameRating}
                        onLike={() => {}}
                        onDislike={() => {}}
                        profileLink={false}
                      />
                    </div>
                  ))}
                </div>

                {profiles.length === 0 && !loading && (
                  <p className="text-muted-foreground py-12 text-center">
                    No matches yet. Like profiles to get matches!
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
