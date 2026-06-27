import { apiClient, unwrapData } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { ApiUser, ProfileSummary } from "@/types/user"

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

function asArray<T>(raw: unknown): T[] {
  const data = unwrapData<unknown>(raw)
  return Array.isArray(data) ? (data as T[]) : []
}

export async function getCurrentUserProfile(userId: string): Promise<ApiUser> {
  return apiClient.get<ApiUser>(endpoints.users.byId(userId))
}

export async function getPublicUserProfile(userId: string): Promise<ApiUser> {
  return apiClient.get<ApiUser>(endpoints.users.byId(userId))
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

export async function getConnectedProfile(): Promise<ApiUser> {
  return apiClient.get<ApiUser>(endpoints.profile.me)
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

