/**
 * Pure mapping helpers for the browse page. No network calls — safe to use during render
 * and in callbacks after data has been fetched elsewhere.
 */
import type { Filters, Interest } from "@/features/browse/components/filter-sidebar"
import type { BrowseUserDto, GetInterestsDto } from "@/lib/services/browse-api"

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23999' width='400' height='600'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3ENo photo%3C/text%3E%3C/svg%3E"

function generateAvatarUrl(name: string): string {
  const encoded = encodeURIComponent(name.trim() || "User")
  return `https://ui-avatars.com/api/?name=${encoded}&size=400&background=f43f5e&color=fff&bold=true&format=svg`
}

export interface Profile {
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

export function interestsDtoToList(data: GetInterestsDto[]): Interest[] {
  return data
    .map((i) => ({ id: i.id ?? i.Id ?? "", name: i.name ?? i.Name ?? "" }))
    .filter((x): x is Interest => Boolean(x.id && x.name))
}

export function mapBrowseUserToProfile(
  dto: BrowseUserDto,
  interestsMap: Map<string, string>
): Profile {
  const tags =
    dto.interestIds?.map((id) => interestsMap.get(id) ?? "").filter(Boolean) ??
    []
  const distanceKm = Math.round(dto.distanceInMeters / 1000)
  const location =
    dto.distanceInMeters >= 0 ? `${distanceKm} km away` : "Distance unknown"
  const commonTags = dto.commonTagsCount ?? 0
  const tagScore = Math.min(40, commonTags * 10)
  const dist = dto.distanceInMeters ?? 999999
  const distScore = dist < 5000 ? 30 : dist < 15000 ? 22 : dist < 30000 ? 15 : dist < 50000 ? 8 : 0
  const fame = dto.fameRating ?? 0
  const fameScore = Math.min(20, Math.round(fame / 5))
  const baseScore = 10
  const match = Math.min(100, baseScore + tagScore + distScore + fameScore)

  return {
    id: dto.id,
    name: [dto.firstName, dto.lastName].filter(Boolean).join(" ") || "Unknown",
    age: dto.age ?? 0,
    role: "Member",
    location,
    image: dto.profilePicture ?? generateAvatarUrl([dto.firstName, dto.lastName].filter(Boolean).join(" ")),
    tags,
    bio: "",
    match,
    online: false,
    fameRating: dto.fameRating ?? 0,
  }
}

export function searchPreferencesToFilters(prefs: {
  minAge?: number
  MinAge?: number
  maxAge?: number
  MaxAge?: number
  minFameRating?: number
  MinFameRating?: number
  maxDistanceKm?: number | null
  MaxDistanceKm?: number | null
  savedInterestIds?: string[]
  SavedInterestIds?: string[]
  sortBy?: string
  SortBy?: string
  sortDescending?: boolean
  SortDescending?: boolean
}): Filters {
  const minAge = prefs.minAge ?? prefs.MinAge ?? 18
  const maxAge = prefs.maxAge ?? prefs.MaxAge ?? 100
  const minFameRating = prefs.minFameRating ?? prefs.MinFameRating ?? 0
  const maxDistanceKm = prefs.maxDistanceKm ?? prefs.MaxDistanceKm
  const savedInterestIds = prefs.savedInterestIds ?? prefs.SavedInterestIds ?? []
  const sortBy = prefs.sortBy ?? prefs.SortBy ?? "Distance"
  const sortDescending = prefs.sortDescending ?? prefs.SortDescending ?? false

  const sortByMap: Record<string, Filters["sortBy"]> = {
    Age: "age",
    Distance: "distance",
    FameRating: "fame",
    CommonTags: "recommended",
  }
  return {
    age: [minAge, maxAge],
    distance: maxDistanceKm ?? 25,
    fameRating: minFameRating,
    tagIds: Array.isArray(savedInterestIds) ? savedInterestIds : [],
    sortBy: sortByMap[sortBy] ?? "recommended",
    sortDir: sortDescending ? "desc" : "asc",
  }
}
