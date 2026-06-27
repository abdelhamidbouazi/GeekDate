import type {
  ProfileActivityItem,
  ProfilePhoto,
  ProfileStats,
  UserProfile,
} from "@/types/profile"
import { calculateAge, formatJoinedDate } from "@/lib/utils/profile"
import {
  profileViewerDisplayName,
  resolveProfileMediaUrl,
  type AppUser,
  type ProfileViewerUser,
} from "@/lib/services/profile-api"

const ONLINE_THRESHOLD_MINUTES = 15

export function isUserOnline(
  lastActive: string | null | undefined,
  thresholdMin = ONLINE_THRESHOLD_MINUTES
): boolean {
  if (!lastActive) return false
  try {
    const last = new Date(lastActive).getTime()
    if (Number.isNaN(last)) return false
    return Date.now() - last <= thresholdMin * 60 * 1000
  } catch {
    return false
  }
}

export function extractInterestNames(user: AppUser): string[] {
  return (user.interests ?? [])
    .map((i) => i.interest?.name ?? "")
    .filter(Boolean)
}

export function extractInterestIds(user: AppUser): string[] {
  return (user.interests ?? []).map((i) => i.interestId).filter(Boolean)
}

export function computeCompatibility(
  myInterestIds: string[],
  theirInterestIds: string[],
  interestsMap: Map<string, string>
): { score: number; sharedTags: string[] } {
  const mySet = new Set(myInterestIds)
  const shared = theirInterestIds.filter((id) => mySet.has(id))
  const sharedTags = shared
    .map((id) => interestsMap.get(id) ?? "")
    .filter(Boolean)
  return {
    score: Math.min(100, shared.length * 25),
    sharedTags,
  }
}

export function mapPhotos(user: AppUser): ProfilePhoto[] {
  const photos = user.photos ?? []
  const deduped = dedupeProfilePhotos(photos)
  if (deduped.length === 0) {
    const fallback = resolveProfileMediaUrl(user.photoProfileUrl)
    return [{ id: "fallback", url: fallback, isMain: true }]
  }
  return deduped.map((p) => ({
    id: p.id,
    url: resolveProfileMediaUrl(p.url),
    isMain: p.isMain,
  }))
}

export function dedupeProfilePhotos<T extends { id?: string; url?: string | null; publicId?: string | null }>(
  photos: T[]
): T[] {
  const seenKeys = new Set<string>()
  const result: T[] = []
  for (const p of photos) {
    const publicId = (p as { publicId?: string }).publicId?.trim()
    const id = p.id?.trim() ?? ""
    const url = (p.url ?? "").trim().toLowerCase()
    const key = publicId || id || url
    if (!key || seenKeys.has(key)) continue
    seenKeys.add(key)
    result.push(p)
  }
  return result
}

export function mapAppUserToUserProfile(
  user: AppUser,
  stats?: Partial<ProfileStats>
): UserProfile {
  const photos = mapPhotos(user)
  const mainPhoto = photos.find((p) => p.isMain) ?? photos[0]
  const location =
    [user.city, user.country].filter(Boolean).join(", ") || "Location not set"

  return {
    id: user.id,
    displayName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.userName ||
      "Member",
    userName: user.userName,
    email: user.email,
    age: calculateAge(user.dateOfBirth),
    location,
    bio: user.biography,
    fameRating: user.fameRating ?? 0,
    isOnline: isUserOnline(user.lastActive),
    coverImageUrl: mainPhoto?.url ?? resolveProfileMediaUrl(user.photoProfileUrl),
    avatarUrl: mainPhoto?.url ?? resolveProfileMediaUrl(user.photoProfileUrl),
    photos,
    interests: extractInterestNames(user),
    interestIds: extractInterestIds(user),
    gender: user.gender,
    sexualPreference: user.lookingFor ?? user.preferredGender ?? 0,
    city: user.city,
    country: user.country,
    joinedLabel: formatJoinedDate(user.createdAt),
    stats: {
      visits: stats?.visits ?? 0,
      likes: stats?.likes ?? 0,
      matches: stats?.matches ?? 0,
      fameRating: user.fameRating ?? 0,
    },
  }
}

export function buildActivityFeed(
  views: ProfileViewerUser[],
  likes: ProfileViewerUser[]
): ProfileActivityItem[] {
  const likeItems = likes.slice(0, 5).map((p, i) => ({
    id: `like-${p.id}-${i}`,
    type: "like" as const,
    user: profileViewerDisplayName(p),
    action: "liked your profile",
    time: "",
    avatar: resolveProfileMediaUrl(p.profilePicture),
  }))

  const viewItems = views.slice(0, 5).map((p, i) => ({
    id: `view-${p.id}-${i}`,
    type: "view" as const,
    user: profileViewerDisplayName(p),
    action: "viewed your profile",
    time: "",
    avatar: resolveProfileMediaUrl(p.profilePicture),
  }))

  return [...likeItems, ...viewItems]
}
