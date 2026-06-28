import type { AppUser, AppUserPhoto, UserInterest } from "@/lib/services/profile-api"

function asString(value: unknown): string {
  return value == null ? "" : String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function normalizePhoto(raw: unknown): AppUserPhoto | null {
  if (!raw || typeof raw !== "object") return null
  const photo = raw as Record<string, unknown>
  const id = asString(photo.id ?? photo.Id)
  const url = asString(photo.url ?? photo.Url)
  if (!id && !url) return null
  return {
    id,
    url,
    isMain: Boolean(photo.isMain ?? photo.IsMain),
    publicId: asString(photo.publicId ?? photo.PublicId),
    userId: asString(photo.userId ?? photo.UserId),
  }
}

function normalizeInterest(raw: unknown): UserInterest | null {
  if (!raw || typeof raw !== "object") return null
  const interest = raw as Record<string, unknown>
  const id = asString(interest.id ?? interest.Id)
  const interestId = asString(interest.interestId ?? interest.InterestId)
  if (!id && !interestId) return null
  const nested = interest.interest
  const nestedRecord = nested && typeof nested === "object" ? (nested as Record<string, unknown>) : null
  return {
    id,
    userId: asString(interest.userId ?? interest.UserId),
    interestId,
    interest: nestedRecord
      ? {
          id: asString(nestedRecord.id ?? nestedRecord.Id),
          name: asString(nestedRecord.name ?? nestedRecord.Name),
        }
      : undefined,
  }
}

export function normalizeAppUserRaw(raw: unknown): AppUser {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const photosRaw = item.photos ?? item.Photos
  const interestsRaw = item.interests ?? item.Interests
  const photos = Array.isArray(photosRaw)
    ? photosRaw.map(normalizePhoto).filter((photo): photo is AppUserPhoto => Boolean(photo))
    : []
  const interests = Array.isArray(interestsRaw)
    ? interestsRaw.map(normalizeInterest).filter((interest): interest is UserInterest => Boolean(interest))
    : []
  const photoProfileUrl =
    asString(item.photoProfileUrl ?? item.PhotoProfileUrl) ||
    photos.find((photo) => photo.isMain)?.url ||
    photos[0]?.url ||
    null

  return {
    id: asString(item.id ?? item.Id),
    firstName: asString(item.firstName ?? item.FirstName),
    lastName: asString(item.lastName ?? item.LastName),
    userName: asString(item.userName ?? item.UserName ?? item.username ?? item.Username),
    email: asString(item.email ?? item.Email),
    gender: asNumber(item.gender ?? item.Gender),
    dateOfBirth:
      (item.dateOfBirth ?? item.DateOfBirth) != null
        ? asString(item.dateOfBirth ?? item.DateOfBirth)
        : null,
    biography: asString(item.biography ?? item.Biography),
    lookingFor: asNumber(
      item.lookingFor ?? item.LookingFor ?? item.sexualPreferences ?? item.SexualPreferences,
      0
    ),
    preferredGender: asNumber(
      item.preferredGender ?? item.PreferredGender ?? item.sexualPreferences ?? item.SexualPreferences,
      0
    ),
    city: (item.city ?? item.City) != null ? asString(item.city ?? item.City) : null,
    country: (item.country ?? item.Country) != null ? asString(item.country ?? item.Country) : null,
    photos,
    interests,
    createdAt: asString(item.createdAt ?? item.CreatedAt),
    lastActive: asString(item.lastActive ?? item.LastActive),
    emailConfirmed: Boolean(item.emailConfirmed ?? item.EmailConfirmed),
    fameRating: asNumber(item.fameRating ?? item.FameRating),
    latitude: asNumber(item.latitude ?? item.Latitude),
    longitude: asNumber(item.longitude ?? item.Longitude),
    photoProfileUrl,
    pictureUrl: photoProfileUrl,
    isLikedByMe: Boolean(item.isLikedByMe ?? item.IsLikedByMe),
    isLikedByThem: Boolean(item.isLikedByThem ?? item.IsLikedByThem),
    isMatched: Boolean(item.isMatched ?? item.IsMatched),
  }
}
