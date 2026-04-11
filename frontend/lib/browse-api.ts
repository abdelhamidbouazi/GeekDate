import { api } from "./api";
import { dedupeAsync } from "./request-dedupe";

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

export interface GetInterestsDto {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  users?: unknown[];
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
    MaxDistanceKm: filters.distance,
    SavedInterestIds: validInterestIds,
    SortBy: SORT_BY_MAP[filters.sortBy] ?? "CommonTags",
    SortDescending: filters.sortDir === "desc",
  };
}

export const browseApi = {
  browseUsers: () => api.get<BrowseUserDto[]>("/api/Matchmaking"),

  searchUsers: (prefs: SearchPreferencesRequest) =>
    api.post<BrowseUserDto[]>("/api/Matchmaking/search", prefs),

  getSearchPreferences: () =>
    dedupeAsync("browseApi:getSearchPreferences", async () => {
      const r = await api.get<{
        data?: SearchPreferencesDto;
        Data?: SearchPreferencesDto;
      }>("/api/search/preferences");
      return r?.data ?? r?.Data ?? null;
    }),

  updateSearchPreferences: (prefs: SearchPreferencesRequest) =>
    api.put("/api/search/preferences", prefs),

  resetSearchPreferences: () =>
    api.post("/api/search/preferences/reset"),

  getInterests: () =>
    dedupeAsync("browseApi:getInterests", async () => {
      const res = await api.get<{ data?: GetInterestsDto[]; Data?: GetInterestsDto[] } | GetInterestsDto[]>(
        "/api/Interest/GetAll"
      );
      const arr = Array.isArray(res) ? res : (res?.data ?? res?.Data);
      return Array.isArray(arr) ? arr : [];
    }),

  likeProfile: (userId: string) =>
    api.post(`/api/Users/like-profile/${userId}`),

  unlikeProfile: (userId: string) =>
    api.post(`/api/Users/unlike-profile/${userId}`),
};
