import { api } from "./api";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
  /\/$/,
  ""
);

/** Placeholder for missing profile images (Next/Image compatible). */
export const PROFILE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23d4e8dc'/%3E%3Cstop offset='100%25' style='stop-color:%23a8d4b8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='500'/%3E%3Ctext fill='%235c6b63' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18'%3ENo photo%3C/text%3E%3C/svg%3E";

/**
 * Absolute URL for API-hosted or relative media paths (e.g. Cloudinary or `/uploads/...`).
 */
export function resolveProfileMediaUrl(url: string | null | undefined): string {
  if (url == null || !String(url).trim()) return PROFILE_IMAGE_PLACEHOLDER;
  const u = String(url).trim();
  if (u.startsWith("data:")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? u : `/${u}`}`;
}

function coerceViewerAge(v: unknown): number | null | undefined {
  if (v == null) return undefined;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

/**
 * Maps API payloads whether JSON uses camelCase or PascalCase property names.
 */
export function normalizeProfileViewerRaw(raw: unknown): ProfileViewerUser {
  if (raw == null || typeof raw !== "object") {
    return { id: "" };
  }
  const o = raw as Record<string, unknown>;
  const idVal = o.id ?? o.Id;
  const id = idVal != null ? String(idVal) : "";
  const pic =
    o.profilePicture ??
    o.ProfilePicture ??
    o.pictureUrl ??
    o.PictureUrl;
  return {
    id,
    firstName: (o.firstName ?? o.FirstName) as string | null | undefined,
    lastName: (o.lastName ?? o.LastName) as string | null | undefined,
    age: coerceViewerAge(o.age ?? o.Age),
    profilePicture:
      typeof pic === "string" ? pic : pic != null ? String(pic) : null,
  };
}

/** GET /api/Users/me — backend UserDto (camelCase JSON). */
export interface AuthenticatedUserSummary {
  userName: string;
  pictureUrl: string | null;
  notificationCount?: number;
  unreadMessagesCount?: number;
}

/**
 * GET /api/Users/profile-views and profile-likes —
 * UserProfileViewerDto / UserProfileLikedDto (camelCase JSON).
 */
export interface ProfileViewerUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  profilePicture?: string | null;
}

export function profileViewerDisplayName(v: ProfileViewerUser): string {
  const name = [v.firstName, v.lastName]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .join(" ");
  return name || "Member";
}

/**
 * Decode JWT payload to extract user_id (no verification, client-side only).
 */
const NAME_ID =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<
      string,
      string | undefined
    >;
    return payload.user_id ?? payload.sub ?? payload[NAME_ID] ?? null;
  } catch {
    return null;
  }
}

/** GET /api/Users/{userId} — includes mutual like / match flags after liking. */
export interface UserLikeInfo {
  firstName?: string;
  lastName?: string;
  isLikedByMe?: boolean;
  isLikedByThem?: boolean;
  isMatched?: boolean;
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

export interface ImageDto {
  id: string;
  url: string;
  publicId: string;
  isMain: boolean;
}

export const profileApi = {
  getMe: () => api.get<AuthenticatedUserSummary>("/api/Users/me"),

  getUser: (userId: string) => api.get<AppUser>(`/api/Users/${userId}`),

  getUserLikeInfo: (userId: string) => api.get<UserLikeInfo>(`/api/Users/${userId}`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postFormData<ImageDto>("/api/Users/upload-image", formData);
  },

  setMainPhoto: (photoId: string, userId: string) =>
    api.put<void>(`/api/Users/set-main-photo/${photoId}?userId=${userId}`),

  deletePhoto: (photoId: string) => api.delete<void>(`/api/Users/delete-photo/${photoId}`),

  getProfileViews: async () => {
    const data = await api.get<unknown[]>("/api/Users/profile-views");
    if (!Array.isArray(data)) return [];
    return data.map(normalizeProfileViewerRaw);
  },

  getProfileLikes: async () => {
    const data = await api.get<unknown[]>("/api/Users/profile-likes");
    if (!Array.isArray(data)) return [];
    return data.map(normalizeProfileViewerRaw);
  },

  markProfileViewed: (userId: string) =>
    api.post<void>(`/api/Users/mark-profile-as-viewed/${userId}`),

  blockProfile: (userId: string) =>
    api.post<void>(`/api/Users/block-profile/${userId}`),

  getConnectedProfile: () =>
    api.get<{
      latitude?: number;
      longitude?: number;
      Latitude?: number;
      Longitude?: number;
      [key: string]: unknown;
    }>("/api/UserProfile/me"),

  setLocation: (lat: number, lng: number) =>
    api.post<void>("/api/UserProfile/set-location", {
      Latitude: lat,
      Longitude: lng,
    }),
};
