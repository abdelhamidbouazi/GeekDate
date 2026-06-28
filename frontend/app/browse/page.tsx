"use client"

import dynamic from "next/dynamic"
import { useState, useRef, useEffect, useCallback } from "react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { UserCard } from "@/components/shared/user-card"
import {
  RightFilterSidebar,
  defaultFilters,
  type Filters,
  type Interest,
} from "@/features/browse/components/filter-sidebar"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { toast } from "sonner"
import { profileApi } from "@/lib/services/profile-api"
import {
  browseApi,
  filtersToSearchPreferences,
} from "@/lib/services/browse-api"
import {
  mapBrowseUserToProfile,
  searchPreferencesToFilters,
  interestsDtoToList,
  type Profile,
} from "@/features/browse/lib/browse-helpers"

const MatchCelebration = dynamic(
  () =>
    import("@/components/shared/match-celebration").then((m) => ({
      default: m.MatchCelebration,
    })),
  { ssr: false }
)

export default function BrowsePage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchOpen, setMatchOpen] = useState(false)
  const [matchPartner, setMatchPartner] = useState<{ name: string; image: string } | null>(null)

  const hasActiveFilters =
    filters.tagIds.length > 0 ||
    filters.sortBy !== "recommended" ||
    filters.age[0] !== defaultFilters.age[0] ||
    filters.age[1] !== defaultFilters.age[1] ||
    filters.distance !== defaultFilters.distance ||
    filters.fameRating !== defaultFilters.fameRating

  const buildInterestsMap = useCallback((list: Interest[]) => {
    const map = new Map<string, string>()
    list.forEach((i) => map.set(i.id, i.name))
    return map
  }, [])

  const fetchProfiles = useCallback(
    async (searchFilters?: Filters, interestsList?: Interest[]) => {
      setLoading(true)
      setError(null)
      try {
        const prefs = searchFilters ?? filters
        const useFilteredSearch =
          prefs.tagIds.length > 0 || prefs.sortBy !== "recommended"

        const dtos = useFilteredSearch
          ? await browseApi.searchUsers(filtersToSearchPreferences(prefs))
          : await browseApi.browseUsers()

        const map = interestsList ? buildInterestsMap(interestsList) : buildInterestsMap(interests)
        setProfiles(dtos.map((d) => mapBrowseUserToProfile(d, map)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profiles")
        setProfiles([])
      } finally {
        setLoading(false)
      }
    },
    [filters, interests, buildInterestsMap]
  )

  const fetchProfilesRef = useRef(fetchProfiles)
  fetchProfilesRef.current = fetchProfiles

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const [interestsRaw, prefs] = await Promise.all([
          browseApi.getInterests(),
          browseApi.getSearchPreferences().catch(() => null),
        ])
        if (cancelled) return

        const interestList = interestsDtoToList(interestsRaw)
        setInterests(interestList)

        if (prefs) {
          const loadedFilters = searchPreferencesToFilters(prefs)
          setFilters(loadedFilters)
          await fetchProfilesRef.current(loadedFilters, interestList)
        } else {
          await fetchProfilesRef.current(undefined, interestList)
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load interests")
        setInterests([])
        setProfiles([])
        setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  const handleApplyFilters = useCallback(
    async (appliedFilters: Filters) => {
      setFilters(appliedFilters)
      await browseApi.updateSearchPreferences(filtersToSearchPreferences(appliedFilters)).catch(() => {})
      await fetchProfiles(appliedFilters, interests)
    },
    [fetchProfiles, interests]
  )

  const handleResetFilters = useCallback(async () => {
    setFilters(defaultFilters)
    await browseApi.resetSearchPreferences().catch(() => {})
    await fetchProfiles(defaultFilters, interests)
  }, [fetchProfiles, interests])

  const handleLike = useCallback(async (userId: string) => {
    const profile = profiles.find((p) => p.id === userId)
    try {
      await browseApi.likeProfile(userId)
      const info = await profileApi.getUserLikeInfo(userId)
      if (info.isMatched && profile) {
        setMatchPartner({ name: profile.name, image: profile.image })
        setMatchOpen(true)
      }
      setProfiles((prev) => prev.filter((p) => p.id !== userId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not like this profile.")
    }
  }, [profiles])

  const handleDislike = useCallback((userId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== userId))
  }, [])

  return (
    <AuthenticatedShell
      siteHeaderProps={{ onFiltersOpen: () => setFiltersOpen(true) }}
    >
        <RightFilterSidebar
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          interests={interests}
        />
        <div className="relative flex flex-1 flex-col">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <p className="text-muted-foreground">Loading profiles...</p>
            </div>
          )}
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-6 rounded-[2rem] border border-primary/10 bg-linear-to-br from-card via-card to-primary/8 p-6 shadow-xl shadow-rose-950/5">
                  <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-primary">
                    Discover
                  </div>
                  <h1 className="mb-2 text-3xl font-black tracking-tight">Find your next spark</h1>
                  <p className="text-muted-foreground">
                    Browse real profiles, spot the chemistry, and make the first move with confidence.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchProfiles()} className="mt-2">
                      Try again
                    </Button>
                  </div>
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
                        onLike={() => handleLike(profile.id)}
                        onDislike={() => handleDislike(profile.id)}
                      />
                    </div>
                  ))}
                </div>

                {profiles.length === 0 && !loading && (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <p className="text-muted-foreground">
                      {hasActiveFilters
                        ? "No profiles match your filters. Try adjusting your search."
                        : "No profiles to show yet. Create another account (or ask a friend) and complete their profile so you have someone to browse."}
                    </p>
                    <Button onClick={() => setFiltersOpen(true)} variant="outline">
                      <Filter className="mr-2 size-4" />
                      Adjust filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      <MatchCelebration
        open={matchOpen && !!matchPartner}
        onOpenChange={(o) => {
          setMatchOpen(o)
          if (!o) setMatchPartner(null)
        }}
        name={matchPartner?.name ?? ""}
        image={matchPartner?.image ?? ""}
      />
    </AuthenticatedShell>
  )
}
