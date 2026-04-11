"use client"

/**
 * Browse / discover profiles route.
 *
 * Backend calls (see Swagger UI: http://localhost:8080/swagger/index.html):
 * - Initial load: GET interests + GET search preferences in parallel, then exactly one of
 *   GET /api/Matchmaking or POST /api/Matchmaking/search (see fetchProfiles).
 * - Apply filters: PUT /api/search/preferences, then one list fetch.
 * - Reset filters: POST /api/search/preferences/reset, then one list fetch.
 * - Like / dislike: POST like-profile or unlike-profile for that user id.
 *
 * Each profile photo URL loaded by next/image is a separate HTTP request to the API host
 * (distinct from the JSON calls above).
 */
import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { UserCard } from "@/components/user-card"
import {
  RightFilterSidebar,
  defaultFilters,
  type Filters,
  type Interest,
} from "@/components/filter-sidebar"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  browseApi,
  filtersToSearchPreferences,
} from "@/lib/browse-api"
import {
  mapBrowseUserToProfile,
  searchPreferencesToFilters,
  interestsDtoToList,
  type Profile,
} from "./browse-helpers"
import { TikTokCard } from "./tiktok-card"

export default function BrowsePage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useIsMobile()

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
        const hasNonDefaultFilters =
          prefs.tagIds.length > 0 ||
          prefs.sortBy !== "recommended" ||
          prefs.age[0] !== defaultFilters.age[0] ||
          prefs.age[1] !== defaultFilters.age[1] ||
          prefs.distance !== defaultFilters.distance ||
          prefs.fameRating !== defaultFilters.fameRating

        const dtos = hasNonDefaultFilters
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

  const handleLike = useCallback((userId: string) => {
    browseApi.likeProfile(userId).catch(() => {})
    setProfiles((prev) => prev.filter((p) => p.id !== userId))
  }, [])

  const handleDislike = useCallback((userId: string) => {
    browseApi.unlikeProfile(userId).catch(() => {})
    setProfiles((prev) => prev.filter((p) => p.id !== userId))
  }, [])

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return

    const cardHeight = container.clientHeight
    container.scrollTo({
      top: index * cardHeight,
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const cardHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / cardHeight)

      setCurrentIndex((prevIndex) => {
        if (newIndex !== prevIndex && newIndex >= 0 && newIndex < profiles.length) {
          return newIndex
        }
        return prevIndex
      })
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [isMobile, profiles.length])

  useEffect(() => {
    if (!isMobile) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        setCurrentIndex((prevIndex) => {
          if (prevIndex < profiles.length - 1) {
            const nextIndex = prevIndex + 1
            scrollToIndex(nextIndex)
            return nextIndex
          }
          return prevIndex
        })
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        setCurrentIndex((prevIndex) => {
          if (prevIndex > 0) {
            const prevIdx = prevIndex - 1
            scrollToIndex(prevIdx)
            return prevIdx
          }
          return prevIndex
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile, scrollToIndex, profiles.length])

  if (loading && profiles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading profiles...</p>
      </div>
    )
  }

  if (error && profiles.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchProfiles()}>Try again</Button>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black pb-16">
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full shadow-lg"
          onClick={() => setFiltersOpen(true)}
          aria-label="Open filters"
        >
          <Filter className="size-5" />
        </Button>
        <RightFilterSidebar
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          interests={interests}
        />
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        )}
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {profiles.length === 0 && !loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
              <p className="text-center text-muted-foreground">
                {hasActiveFilters
                  ? "No profiles match your filters. Try adjusting your search."
                  : "No profiles to show yet. Create another account (or ask a friend) and complete their profile so you have someone to browse."}
              </p>
              <Button onClick={() => setFiltersOpen(true)} variant="outline">
                <Filter className="mr-2 size-4" />
                Adjust filters
              </Button>
            </div>
          ) : (
            profiles.map((profile, index) => (
              <TikTokCard
                key={profile.id}
                profile={profile}
                isActive={index === currentIndex}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader onFiltersOpen={() => setFiltersOpen(true)} />
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
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Discover Profiles</h1>
                  <p className="text-muted-foreground">
                    Find your perfect geek match. Browse through profiles of developers, gamers, and tech enthusiasts.
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
      </SidebarInset>
    </SidebarProvider>
  )
}
