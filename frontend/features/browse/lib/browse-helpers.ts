/**
 * Pure mapping helpers for the browse page. No network calls — safe to use during render
 * and in callbacks after data has been fetched elsewhere.
 */
import type { Filters, Interest } from "@/features/browse/components/filter-sidebar"
import type { BrowseUserDto, GetInterestsDto } from "@/lib/services/browse-api"
import { resolveProfileMediaUrl } from "@/lib/services/profile-api"

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23999' width='400' height='600'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3ENo photo%3C/text%3E%3C/svg%3E"

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
  const match = Math.min(100, (dto.commonTagsCount ?? 0) * 25)

  const rawPicture =
    dto.profilePicture ??
    (dto as BrowseUserDto & { ProfilePicture?: string | null }).ProfilePicture

  return {
    id: dto.id,
    name: [dto.firstName, dto.lastName].filter(Boolean).join(" ") || "Unknown",
    age: dto.age ?? 0,
    role: "Member",
    location,
    image: resolveProfileMediaUrl(rawPicture ?? null),
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
