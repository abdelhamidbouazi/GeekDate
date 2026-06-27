import { apiClient, unwrapData } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { getConversations } from "@/lib/api/conversations"
import type { ApiUser, ProfileSummary } from "@/types/user"

const NAME_ID =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"

export function getCurrentUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("accessToken")
  if (!token) return null
  try {
    const [, payload] = token.split(".")
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, string | undefined>
    return json.user_id ?? json.sub ?? json[NAME_ID] ?? null
  } catch {
    return null
  }
}

function normalizeSummary(raw: unknown): ProfileSummary {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const id = item.id ?? item.Id
  const photos = item.photos ?? item.Photos
  const mainPhoto = Array.isArray(photos)
    ? photos.find((photo) => {
        const record = photo as Record<string, unknown>
        return Boolean(record.isMain ?? record.IsMain)
      }) ?? photos[0]
    : null
  const mainPhotoRecord =
    mainPhoto && typeof mainPhoto === "object"
      ? (mainPhoto as Record<string, unknown>)
      : null
  const picture =
    item.profilePicture ??
    item.ProfilePicture ??
    item.pictureUrl ??
    item.PictureUrl ??
    item.photoProfileUrl ??
    item.PhotoProfileUrl ??
    mainPhotoRecord?.url ??
    mainPhotoRecord?.Url
  const dateOfBirth = item.dateOfBirth ?? item.DateOfBirth
  const age =
    typeof (item.age ?? item.Age) === "number"
      ? ((item.age ?? item.Age) as number)
      : typeof dateOfBirth === "string"
        ? calculateAgeFromDate(dateOfBirth)
        : null

  return {
    id: id != null ? String(id) : "",
    firstName: (item.firstName ?? item.FirstName) as string | null | undefined,
    lastName: (item.lastName ?? item.LastName) as string | null | undefined,
    userName: (item.userName ?? item.UserName ?? item.username) as string | null | undefined,
    age,
    city: (item.city ?? item.City) as string | null | undefined,
    country: (item.country ?? item.Country) as string | null | undefined,
    profilePicture: typeof picture === "string" ? picture : null,
    matchedAt: (item.matchedAt ?? item.MatchedAt) as string | null | undefined,
  }
}

function getBooleanField(record: unknown, camel: string, pascal: string): boolean {
  if (!record || typeof record !== "object") return false
  const item = record as Record<string, unknown>
  return Boolean(item[camel] ?? item[pascal])
}

function isMatchedProfile(profile: ApiUser): boolean {
  return getBooleanField(profile, "isMatched", "IsMatched")
}

function calculateAgeFromDate(dateString: string): number | null {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDelta = today.getMonth() - date.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) {
    age -= 1
  }
  return age
}

async function getAllUsers(): Promise<ApiUser[]> {
  const raw = await apiClient.get<unknown>(endpoints.users.list)
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data) ? (data as ApiUser[]) : []
}

async function getDirectProfileSummaryList(path: string): Promise<ProfileSummary[]> {
  const raw = await apiClient.get<unknown>(path)
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data)
    ? data
        .map(normalizeSummary)
        .filter((profile): profile is ProfileSummary => Boolean(profile.id))
    : []
}

export async function getPublicUserProfile(userId: string): Promise<ApiUser> {
  return apiClient.get<ApiUser>(endpoints.users.byId(userId))
}

export async function likeProfile(userId: string) {
  return apiClient.post<void>(endpoints.users.likeProfile(userId), {})
}

export async function unlikeProfile(userId: string) {
  return apiClient.post<void>(endpoints.users.unlikeProfile(userId), {})
}

export async function getReceivedLikes(): Promise<ProfileSummary[]> {
  const direct = await getDirectProfileSummaryList(endpoints.users.profileLikes).catch(() => [])
  if (direct.length > 0) {
    return filterMatchedSummaries(
      direct,
      (profile) => getBooleanField(profile, "isLikedByThem", "IsLikedByThem")
    )
  }
  return getProfilesByLikeStatus(
    (profile) => getBooleanField(profile, "isLikedByThem", "IsLikedByThem") && !isMatchedProfile(profile)
  )
}

export async function getMatches(): Promise<ProfileSummary[]> {
  const byStatus = await getProfilesByLikeStatus((profile) => getBooleanField(profile, "isMatched", "IsMatched"))
  if (byStatus.length > 0) return byStatus

  const currentUserId = getCurrentUserIdFromToken()
  if (!currentUserId) return []
  const conversations = await getConversations().catch(() => [])
  const otherIds = conversations
    .map((conversation) => conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id)
    .filter(Boolean)
  return hydrateProfileIds(otherIds)
}

export async function getGivenLikes(): Promise<ProfileSummary[]> {
  const direct = await getDirectProfileSummaryList(endpoints.users.likesGiven).catch(() => [])
  if (direct.length > 0) {
    return filterMatchedSummaries(
      direct,
      (profile) => getBooleanField(profile, "isLikedByMe", "IsLikedByMe")
    )
  }
  return getProfilesByLikeStatus(
    (profile) => getBooleanField(profile, "isLikedByMe", "IsLikedByMe") && !isMatchedProfile(profile)
  )
}

async function filterMatchedSummaries(
  profiles: ProfileSummary[],
  predicate: (profile: ApiUser) => boolean
): Promise<ProfileSummary[]> {
  const currentUserId = getCurrentUserIdFromToken()
  if (!currentUserId) return []

  const summaries = await Promise.all(
    profiles.map(async (summary) => {
      const profile = await getPublicUserProfile(summary.id).catch(() => null)
      if (!profile || !predicate(profile) || isMatchedProfile(profile)) return null
      return summary
    })
  )

  return summaries.filter((profile): profile is ProfileSummary => Boolean(profile?.id))
}

async function getProfilesByLikeStatus(
  predicate: (profile: ApiUser) => boolean
): Promise<ProfileSummary[]> {
  const currentUserId = getCurrentUserIdFromToken()
  if (!currentUserId) return []

  const users = await getAllUsers()
  const candidates = users
    .map((user) => String(user.id ?? ""))
    .filter((id) => id && id !== currentUserId)

  const summaries = await Promise.all(
    candidates.map(async (id) => {
      const profile = await getPublicUserProfile(id).catch(() => null)
      if (!profile || !predicate(profile)) return null
      return normalizeSummary({
        ...profile,
        id,
        profilePicture:
          profile.photoProfileUrl ??
          profile.pictureUrl ??
          profile.photos?.find((photo) => photo.isMain)?.url ??
          profile.photos?.[0]?.url,
      })
    })
  )

  return summaries.filter((profile): profile is ProfileSummary => Boolean(profile?.id))
}

async function hydrateProfileIds(ids: string[]): Promise<ProfileSummary[]> {
  const profiles = await Promise.all(
    ids.map(async (id) => {
      const profile = await getPublicUserProfile(id).catch(() => null)
      if (!profile) return null
      return normalizeSummary({
        ...profile,
        id,
        profilePicture:
          profile.photoProfileUrl ??
          profile.pictureUrl ??
          profile.photos?.find((photo) => photo.isMain)?.url ??
          profile.photos?.[0]?.url,
      })
    })
  )
  return profiles.filter((profile): profile is ProfileSummary => Boolean(profile?.id))
}
