import { api } from "./api";

/**
 * Decode JWT payload to extract user_id (no verification, client-side only).
 */
export function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.user_id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

export interface AppUserPhoto {
  id: string;
  url: string;
  isMain: boolean;
  publicId: string;
  userId: string;
}

export interface UserInterest {
  id: string;
  userId: string;
  interestId: string;
  interest?: { id: string; name: string };
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  gender: number;
  dateOfBirth: string | null;
  biography: string | null;
  lookingFor: number;
  preferredGender: number;
  city: string | null;
  country: string | null;
  photos: AppUserPhoto[];
  createdAt: string;
  lastActive: string;
  emailConfirmed: boolean;
  fameRating: number;
  latitude: number;
  longitude: number;
  photoProfileUrl: string | null;
  interests?: UserInterest[];
}

export interface UserProfileView {
  userName: string;
  pictureUrl: string | null;
  notificationCount?: number;
  unreadMessagesCount?: number;
}

export interface ImageDto {
  id: string;
  url: string;
  publicId: string;
  isMain: boolean;
}

export const profileApi = {
  getMe: () => api.get<UserProfileView>("/api/Users/me"),

  getUser: (userId: string) => api.get<AppUser>(`/api/Users/${userId}`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postFormData<ImageDto>("/api/Users/upload-image", formData);
  },

  setMainPhoto: (photoId: string, userId: string) =>
    api.put<void>(`/api/Users/set-main-photo/${photoId}?userId=${userId}`),

  deletePhoto: (photoId: string) => api.delete<void>(`/api/Users/delete-photo/${photoId}`),

  getProfileViews: () => api.get<UserProfileView[]>("/api/Users/profile-views"),

  getProfileLikes: () => api.get<UserProfileView[]>("/api/Users/profile-likes"),
};
