import { apiClient, unwrapData } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { ApiUser, ProfileSummary } from "@/types/user"
import { normalizeAppUserRaw } from "@/lib/utils/normalize-app-user"

export interface UpdateProfilePayload {
  userId: string
  firstName: string
  lastName: string
  email: string
  gender: number
  biography: string
  sexualPreferences: number
  userInterestIds: string[]
  city: string
}

export interface UploadedPhotoDto {
  id: string
  url: string
  publicId: string
  isMain: boolean
}

export interface ConnectedProfilePhoto {
  id: string
  userId: string
  url: string
  isMain: boolean
  publicId: string
}

export interface ConnectedUserProfile {
  firstName: string
  lastName: string
  userName: string
  email: string
  gender: number
  dateOfBirth: string | null
  biography: string
  preferredGender: number
  interests: Array<{ id: string; name: string }>
  profileViews: number
  city: string
  country: string
  pictures: ConnectedProfilePhoto[]
  userLikes: number
  emailConfirmed: boolean
  isBasicInfoComplete: boolean
  isPreferencesComplete: boolean
  isProfileCompleted: boolean
  fameRating: number
  latitude: number
  longitude: number
}

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

function normalizeConnectedProfile(raw: unknown): ConnectedUserProfile {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const interestsRaw = item.interests ?? item.Interests
  const interests = Array.isArray(interestsRaw)
    ? interestsRaw.map((interest) => {
        const record = interest as Record<string, unknown>
        return {
          id: asString(record.id ?? record.Id),
          name: asString(record.name ?? record.Name),
        }
      })
    : []
  const picturesRaw = item.pictures ?? item.Pictures
  const pictures = Array.isArray(picturesRaw)
    ? picturesRaw.map((photo) => {
        const record = photo as Record<string, unknown>
        return {
          id: asString(record.id ?? record.Id),
          userId: asString(record.userId ?? record.UserId),
          url: asString(record.url ?? record.Url),
          isMain: Boolean(record.isMain ?? record.IsMain),
          publicId: asString(record.publicId ?? record.PublicId),
        }
      })
    : []

  return {
    firstName: asString(item.firstName ?? item.FirstName),
    lastName: asString(item.lastName ?? item.LastName),
    userName: asString(item.userName ?? item.UserName),
    email: asString(item.email ?? item.Email),
    gender: asNumber(item.gender ?? item.Gender),
    dateOfBirth:
      (item.dateOfBirth ?? item.DateOfBirth) != null
        ? asString(item.dateOfBirth ?? item.DateOfBirth)
        : null,
    biography: asString(item.biography ?? item.Biography),
    preferredGender: asNumber(item.preferredGender ?? item.PreferredGender),
    interests,
    profileViews: asNumber(item.profileViews ?? item.ProfileViews),
    city: asString(item.city ?? item.City),
    country: asString(item.country ?? item.Country),
    pictures,
    userLikes: asNumber(item.userLikes ?? item.UserLikes),
    emailConfirmed: Boolean(item.emailConfirmed ?? item.EmailConfirmed),
    isBasicInfoComplete: Boolean(item.isBasicInfoComplete ?? item.IsBasicInfoComplete),
    isPreferencesComplete: Boolean(item.isPreferencesComplete ?? item.IsPreferencesComplete),
    isProfileCompleted: Boolean(item.isProfileCompleted ?? item.IsProfileCompleted),
    fameRating: asNumber(item.fameRating ?? item.FameRating),
    latitude: asNumber(item.latitude ?? item.Latitude),
    longitude: asNumber(item.longitude ?? item.Longitude),
  }
}

function asArray<T>(raw: unknown): T[] {
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data) ? (data as T[]) : []
}

export async function getCurrentUserProfile(userId: string): Promise<ApiUser> {
  return normalizeAppUserRaw(await apiClient.get<unknown>(endpoints.users.byId(userId)))
}

export async function getPublicUserProfile(userId: string): Promise<ApiUser> {
  return normalizeAppUserRaw(await apiClient.get<unknown>(endpoints.users.byId(userId)))
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiClient.put<unknown>(endpoints.profile.updateProfile, payload)
}

export function uploadProfilePhoto(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient.post<UploadedPhotoDto>(endpoints.users.uploadImage, formData)
}

export function deleteProfilePhoto(photoId: string) {
  return apiClient.delete<void>(endpoints.users.deletePhoto(photoId))
}

export function setMainProfilePhoto(photoId: string) {
  return apiClient.put<void>(endpoints.users.setMainPhoto(photoId), {})
}

export async function getProfileViews(): Promise<ProfileSummary[]> {
  return asArray<ProfileSummary>(await apiClient.get<unknown>(endpoints.users.profileViews))
}

export async function getReceivedLikes(): Promise<ProfileSummary[]> {
  return asArray<ProfileSummary>(await apiClient.get<unknown>(endpoints.users.profileLikes))
}

export function markProfileViewed(userId: string) {
  return apiClient.post<void>(endpoints.users.markViewed(userId), {})
}

export function blockProfile(userId: string) {
  return apiClient.post<void>(endpoints.users.blockProfile(userId), {})
}

export async function getConnectedProfile(): Promise<ConnectedUserProfile> {
  const raw = await apiClient.get<unknown>(endpoints.profile.me)
  return normalizeConnectedProfile(unwrapData(raw))
}

export function setLocation(lat: number, lng: number) {
  return apiClient.post<void>(endpoints.profile.setLocation, {
    latitude: lat,
    longitude: lng,
  })
}

export function completeBasicProfile(formData: FormData) {
  return apiClient.put<unknown>(endpoints.profile.completeBasic, formData)
}

export function completePreferences(formData: FormData) {
  return apiClient.put<unknown>(endpoints.profile.completePreferences, formData)
}
