import { api } from "./api";
import { getMatches, getReceivedLikes, getGivenLikes } from "@/lib/api/users";
import { getApiOrigin } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import {
  completeBasicProfile,
  completePreferences,
} from "@/lib/api/profile";

const API_ORIGIN = getApiOrigin();

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

export function normalizeProfileSummaryRaw(raw: unknown): ProfileSummaryUser {
  const base = normalizeProfileViewerRaw(raw);
  if (raw == null || typeof raw !== "object") {
    return base;
  }
  const o = raw as Record<string, unknown>;
  const matchedAt = o.matchedAt ?? o.MatchedAt;
  return {
    ...base,
    userName: (o.userName ?? o.UserName) as string | null | undefined,
    city: (o.city ?? o.City) as string | null | undefined,
    country: (o.country ?? o.Country) as string | null | undefined,
    matchedAt:
      matchedAt != null && String(matchedAt).trim()
        ? String(matchedAt)
        : null,
  };
}

function normalizeLikeInfo(raw: unknown): UserLikeInfo {
  if (!raw || typeof raw !== "object") return {}
  const o = raw as Record<string, unknown>
  return {
    firstName: (o.firstName ?? o.FirstName) as string | undefined,
    lastName: (o.lastName ?? o.LastName) as string | undefined,
    isLikedByMe: Boolean(o.isLikedByMe ?? o.IsLikedByMe),
    isLikedByThem: Boolean(o.isLikedByThem ?? o.IsLikedByThem),
    isMatched: Boolean(o.isMatched ?? o.IsMatched),
  }
}

async function fetchProfileSummaryList(path: string): Promise<ProfileSummaryUser[]> {
  const data = await api.get<unknown[]>(path);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeProfileSummaryRaw);
}

/** GET /api/Users/me — backend UserDto (camelCase JSON). */
export interface AuthenticatedUserSummary {
  userName: string;
  pictureUrl: string | null;
  notificationCount?: number;
  unreadMessagesCount?: number;
}

/**
 * GET /api/Users/profile-views, profile-likes, matches, likes/* —
 * UserProfileViewerDto / UserProfileLikedDto (camelCase JSON).
 */
export interface ProfileViewerUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  profilePicture?: string | null;
}

export interface ProfileSummaryUser extends ProfileViewerUser {
  userName?: string | null;
  city?: string | null;
  country?: string | null;
  matchedAt?: string | null;
}

export function profileViewerDisplayName(v: ProfileViewerUser): string {
  const name = [v.firstName, v.lastName]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .join(" ");
  return name || "Member";
}

export function profileSummaryDisplayName(v: ProfileSummaryUser): string {
  const full = profileViewerDisplayName(v);
  if (full !== "Member") return full;
  const un = v.userName?.trim();
  return un || "Member";
}

export function profileSummaryLocation(v: ProfileSummaryUser): string | null {
  const parts = [v.city, v.country]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
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

export interface UpdateProfilePayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: number;
  biography: string;
  sexualPreferences: number;
  userInterestIds: string[];
  city: string;
}

export const profileApi = {
  getMe: () => api.get<AuthenticatedUserSummary>(endpoints.users.me),

  getUser: (userId: string) => api.get<AppUser>(endpoints.users.byId(userId)),

  getUserLikeInfo: async (userId: string) =>
    normalizeLikeInfo(await api.get<UserLikeInfo>(endpoints.users.byId(userId))),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postFormData<ImageDto>(endpoints.users.uploadImage, formData);
  },

  setMainPhoto: (photoId: string, userId?: string) => {
    void userId;
    return api.put<void>(endpoints.users.setMainPhoto(photoId));
  },

  deletePhoto: (photoId: string) => api.delete<void>(endpoints.users.deletePhoto(photoId)),

  getProfileViews: async () => {
    const data = await api.get<unknown[]>(endpoints.users.profileViews);
    if (!Array.isArray(data)) return [];
    return data.map(normalizeProfileViewerRaw);
  },

  getProfileLikes: async () => {
    return fetchProfileSummaryList(endpoints.users.profileLikes);
  },

  getMatches: async () => {
    const rows = await getMatches();
    return rows.map(normalizeProfileSummaryRaw);
  },

  getLikesReceived: async () => {
    const rows = await getReceivedLikes();
    return rows.map(normalizeProfileSummaryRaw);
  },

  getLikesGiven: async () => {
    const rows = await getGivenLikes();
    return rows.map(normalizeProfileSummaryRaw);
  },

  markProfileViewed: (userId: string) =>
    api.post<void>(endpoints.users.markViewed(userId)),

  blockProfile: (userId: string) =>
    api.post<void>(endpoints.users.blockProfile(userId)),

  getConnectedProfile: () =>
    api.get<{
      latitude?: number;
      longitude?: number;
      Latitude?: number;
      Longitude?: number;
      [key: string]: unknown;
    }>(endpoints.profile.me),

  setLocation: (lat: number, lng: number) =>
    api.post<void>(endpoints.profile.setLocation, {
      latitude: lat,
      longitude: lng,
    }),

  completeBasicProfile: (formData: FormData) => completeBasicProfile(formData),

  completePreferences: (formData: FormData) => completePreferences(formData),

  updateProfile: (body: UpdateProfilePayload) =>
    api.put<unknown>(endpoints.profile.updateProfile, body),
};
