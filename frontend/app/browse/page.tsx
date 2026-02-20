"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
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
import { Heart, X, MessageCircle, User, MapPin, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  browseApi,
  filtersToSearchPreferences,
  type BrowseUserDto,
} from "@/lib/browse-api"

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23999' width='400' height='600'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3ENo photo%3C/text%3E%3C/svg%3E"

interface Profile {
  id: string
  name: string
  age: number
  role: string
  location: string
  image: string
  tags: string[]
  bio: string
  match: number
  online: boolean
  fameRating: number
}

function mapBrowseUserToProfile(
  dto: BrowseUserDto,
  interestsMap: Map<string, string>
): Profile {
  const tags =
    dto.interestIds?.map((id) => interestsMap.get(id) ?? "").filter(Boolean) ??
    []
  const distanceKm = Math.round(dto.distanceInMeters / 1000)
  const location =
    dto.distanceInMeters >= 0
      ? `${distanceKm} km away`
      : "Distance unknown"
  const match = Math.min(100, (dto.commonTagsCount ?? 0) * 25)

  return {
    id: dto.id,
    name: [dto.firstName, dto.lastName].filter(Boolean).join(" ") || "Unknown",
    age: dto.age ?? 0,
    role: "Member",
    location,
    image: dto.profilePicture ?? PLACEHOLDER_IMAGE,
    tags,
    bio: "",
    match,
    online: false,
    fameRating: dto.fameRating ?? 0,
  }
}

function searchPreferencesToFilters(
  prefs: {
    minAge: number
    maxAge: number
    minFameRating: number
    maxDistanceKm: number | null
    savedInterestIds: string[]
    sortBy: string
    sortDescending: boolean
  }
): Filters {
  const sortByMap: Record<string, Filters["sortBy"]> = {
    Age: "age",
    Distance: "distance",
    FameRating: "fame",
    CommonTags: "recommended",
  }
  return {
    age: [prefs.minAge, prefs.maxAge],
    distance: prefs.maxDistanceKm ?? 25,
    fameRating: prefs.minFameRating,
    tagIds: prefs.savedInterestIds ?? [],
    sortBy: sortByMap[prefs.sortBy] ?? "recommended",
    sortDir: prefs.sortDescending ? "desc" : "asc",
  }
}

function TikTokCard({
  profile,
  isActive,
  onLike,
  onDislike,
}: {
  profile: Profile
  isActive: boolean
  onLike: (id: string) => void
  onDislike: (id: string) => void
}) {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(true)
    onLike(profile.id)
  }

  const handleDislike = () => {
    onDislike(profile.id)
  }

  return (
    <div
      className={cn(
        "relative h-full w-full flex-shrink-0 snap-start snap-always",
        isActive && "z-10"
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={profile.image}
          alt={`${profile.name}, ${profile.age}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority={isActive}
          unoptimized={profile.image.startsWith("data:")}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex flex-col gap-2">
            {profile.online && (
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-white">Online</span>
              </div>
            )}
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
              <span className="text-xs font-bold text-white">{profile.match}% match</span>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <div className="flex items-center gap-1">
              <Heart className="size-3 text-red-400 fill-red-400" />
              <span className="text-xs font-semibold text-white">{profile.fameRating}</span>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-20">
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-3xl font-bold text-white">{profile.name}</h3>
                <span className="text-xl text-white/80">{profile.age}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 mb-1">
                <Code2 className="size-3.5" />
                <span className="text-sm font-medium">{profile.role}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="size-3.5" />
                <span className="text-xs">{profile.location}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons on the right */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-3 z-20">
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg backdrop-blur-md transition-all",
              isLiked
                ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                : "bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
            )}
            onClick={handleLike}
            aria-label="Like"
          >
            <Heart className={cn("size-6", isLiked && "fill-current")} />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30"
            aria-label="Dislike"
            onClick={handleDislike}
          >
            <X className="size-6" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30"
            aria-label="Message"
            asChild
          >
            <Link href={`/messages`}>
              <MessageCircle className="size-6" />
            </Link>
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30"
            aria-label="View Profile"
            asChild
          >
            <Link href={`/users/${profile.id}`}>
              <User className="size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

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

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const interestsData = await browseApi.getInterests()
        if (cancelled) return
        const interestList = interestsData.map((i) => ({ id: i.id, name: i.name }))
        setInterests(interestList)

        const prefs = await browseApi.getSearchPreferences().catch(() => null)
        if (cancelled) return

        if (prefs) {
          const loadedFilters = searchPreferencesToFilters(prefs)
          setFilters(loadedFilters)
          await fetchProfiles(loadedFilters, interestList)
        } else {
          await fetchProfiles(undefined, interestList)
        }
      } catch {
        if (!cancelled) {
          const interestsData = await browseApi.getInterests().catch(() => [])
          const interestList = Array.isArray(interestsData)
            ? interestsData.map((i) => ({ id: i.id, name: i.name }))
            : []
          if (!cancelled) setInterests(interestList)
          await fetchProfiles(undefined, interestList)
        }
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Mobile TikTok-style view
  if (isMobile) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black pb-16">
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {profiles.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No profiles to show</p>
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

  // Desktop grid view
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
        <div className="flex flex-1 flex-col">
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
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No profiles match your filters. Try adjusting your search.</p>
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
