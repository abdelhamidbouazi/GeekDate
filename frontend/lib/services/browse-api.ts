import { api } from "./api";
import { dedupeAsync } from "@/lib/utils/request-dedupe";
import { endpoints } from "@/lib/api/endpoints";

export interface BrowseUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fameRating: number;
  profilePicture: string | null;
  distanceInMeters: number;
  age: number | null;
  commonTagsCount: number;
  interestIds: string[] | null;
}

function normalizeBrowseUser(raw: Record<string, unknown>): BrowseUserDto {
  const interestRaw = raw.interestIds ?? raw.InterestIds
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    firstName: String(raw.firstName ?? raw.FirstName ?? ""),
    lastName: String(raw.lastName ?? raw.LastName ?? ""),
    fameRating: Number(raw.fameRating ?? raw.FameRating ?? 0),
    profilePicture:
      (raw.profilePicture ?? raw.ProfilePicture ?? null) as string | null,
    distanceInMeters: Number(raw.distanceInMeters ?? raw.DistanceInMeters ?? 0),
    age:
      raw.age != null || raw.Age != null
        ? Number(raw.age ?? raw.Age)
        : null,
    commonTagsCount: Number(raw.commonTagsCount ?? raw.CommonTagsCount ?? 0),
    interestIds: Array.isArray(interestRaw)
      ? interestRaw.map((id) => String(id))
      : null,
  }
}

export interface GetInterestsDto {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  users?: unknown[];
}

type InterestCreateResponse = {
  data?: { id?: string; Id?: string; name?: string; Name?: string };
  Data?: { id?: string; Id?: string; name?: string; Name?: string };
};

function unwrapCreatedInterest(r: InterestCreateResponse): { id: string; name: string } {
  const raw = r?.data ?? r?.Data;
  if (!raw) {
    throw new Error("Invalid response when creating interest.");
  }
  const id = raw.id ?? raw.Id;
  if (!id || typeof id !== "string") {
    throw new Error("Invalid response when creating interest.");
  }
  const name = raw.name ?? raw.Name ?? "";
  return { id, name };
}

export interface SearchPreferencesDto {
  minAge: number;
  maxAge: number;
  minFameRating: number;
  maxFameRating: number;
  maxDistanceKm: number | null;
  savedInterestIds: string[];
  sortBy: SearchSortBy;
  sortDescending: boolean;
  isFirstTime?: boolean;
}

export type SearchSortBy = "Age" | "Distance" | "FameRating" | "CommonTags";

export interface SearchPreferencesRequest {
  MinAge: number;
  MaxAge: number;
  MinFameRating: number;
  MaxFameRating: number;
  MaxDistanceKm: number | null;
  SavedInterestIds: string[];
  SortBy: SearchSortBy;
  SortDescending: boolean;
}

const SORT_BY_MAP = {
  recommended: "CommonTags" as const,
  age: "Age" as const,
  distance: "Distance" as const,
  fame: "FameRating" as const,
  tags: "CommonTags" as const,
} satisfies Record<string, SearchSortBy>;

export type FiltersSortBy = keyof typeof SORT_BY_MAP;

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function filtersToSearchPreferences(
  filters: {
    age: [number, number];
    distance: number;
    fameRating: number;
    tagIds: string[];
    sortBy: FiltersSortBy;
    sortDir: "asc" | "desc";
  }
): SearchPreferencesRequest {
  const validInterestIds = filters.tagIds.filter((id) => GUID_REGEX.test(String(id)));
  return {
    MinAge: filters.age[0],
    MaxAge: filters.age[1],
    MinFameRating: filters.fameRating,
    MaxFameRating: 200,
    // Slider max is 100 km; omit cap so the API does not filter by distance (matches "as far as needed").
    MaxDistanceKm: filters.distance >= 100 ? null : filters.distance,
    SavedInterestIds: validInterestIds,
    SortBy: SORT_BY_MAP[filters.sortBy] ?? "CommonTags",
    SortDescending: filters.sortDir === "desc",
  };
}

function normalizeInterestDto(raw: Record<string, unknown>): GetInterestsDto {
  const id = raw.id ?? raw.Id
  const name = raw.name ?? raw.Name
  return {
    id: id != null ? String(id) : undefined,
    name: name != null ? String(name) : undefined,
  }
}

export const browseApi = {
  browseUsers: async () => {
    const data = await api.get<unknown[]>(endpoints.matchmaking.browse)
    return Array.isArray(data) ? data.map((row) => normalizeBrowseUser(row as Record<string, unknown>)) : []
  },

  searchUsers: async (prefs: SearchPreferencesRequest) => {
    const data = await api.post<unknown[]>(endpoints.matchmaking.search, prefs)
    return Array.isArray(data) ? data.map((row) => normalizeBrowseUser(row as Record<string, unknown>)) : []
  },

  getSearchPreferences: () =>
    dedupeAsync("browseApi:getSearchPreferences", async () => {
      const r = await api.get<{
        data?: SearchPreferencesDto;
        Data?: SearchPreferencesDto;
      }>(endpoints.searchPreferences.get);
      return r?.data ?? r?.Data ?? null;
    }),

  updateSearchPreferences: (prefs: SearchPreferencesRequest) =>
    api.put(endpoints.searchPreferences.update, prefs),

  resetSearchPreferences: () =>
    api.post(endpoints.searchPreferences.reset),

  getInterests: () =>
    dedupeAsync("browseApi:getInterests", async () => {
      const res = await api.get<{ data?: unknown[]; Data?: unknown[] } | unknown[]>(
        endpoints.interests.list
      );
      const arr = Array.isArray(res) ? res : (res?.data ?? res?.Data);
      return Array.isArray(arr)
        ? arr.map((row) => normalizeInterestDto(row as Record<string, unknown>))
        : [];
    }),

  /** POST /api/Interest — creates a catalog interest (`{ name }`). */
  createInterest: async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Interest name is required.");
    }
    const r = await api.post<InterestCreateResponse>(endpoints.interests.create, { name: trimmed });
    return unwrapCreatedInterest(r);
  },

  likeProfile: (userId: string) =>
    api.post<void>(endpoints.users.likeProfile(userId), {}),

  unlikeProfile: (userId: string) =>
    api.post<void>(endpoints.users.unlikeProfile(userId), {}),
};
