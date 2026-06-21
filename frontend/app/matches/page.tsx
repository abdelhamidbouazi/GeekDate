"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { UserCard } from "@/components/shared/user-card"
import { Heart, Loader2 } from "lucide-react"
import {
  profileApi,
  profileViewerDisplayName,
  resolveProfileMediaUrl,
  type ProfileViewerUser,
} from "@/lib/services/profile-api"

function mapProfileLikeToCard(p: ProfileViewerUser) {
  const name = profileViewerDisplayName(p)
  return {
    id: p.id,
    name,
    age: p.age && p.age > 0 ? p.age : 0,
    role: "Member",
    location: "Match",
    image: resolveProfileMediaUrl(p.profilePicture),
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
      const raw = Array.isArray(data) ? data : []
      const seen = new Set<string>()
      const list = raw.filter((p) => {
        if (!p.id || seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
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
                      People who liked you back. Start the conversation while the spark is fresh.
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
    </AuthenticatedShell>
  )
}
