export * from "./user"

export interface ProfilePhoto {
  id: string
  url: string
  isMain: boolean
}

export interface ProfileStats {
  visits: number
  likes: number
  matches: number
  fameRating: number
}

export interface ProfileActivityItem {
  id: string
  type: "like" | "view" | "match"
  user: string
  action: string
  time: string
  avatar: string
}

export interface CompatibilityPreview {
  score: number
  sharedTags: string[]
  label: string
}

export interface UserProfile {
  id: string
  displayName: string
  userName: string
  email: string
  age: number | null
  location: string
  bio: string | null
  fameRating: number
  isOnline: boolean
  coverImageUrl: string
  avatarUrl: string
  photos: ProfilePhoto[]
  interests: string[]
  interestIds: string[]
  gender: number
  sexualPreference: number
  city: string | null
  country: string | null
  joinedLabel: string
  stats: ProfileStats
}

export type Gender = "Woman" | "Man" | "Non-binary" | "Other"

export type SexualPreference =
  | "Women"
  | "Men"
  | "Everyone"
  | "Not public"

export type RelationshipState = {
  hasLikedMe: boolean
  likedByMe: boolean
  connected: boolean
}

export interface MatchaPhoto {
  id: string
  url: string
  alt: string
  isMain: boolean
}

export interface PublicMatchaProfile {
  id: string
  firstName: string
  username: string
  age: number
  gender: Gender
  sexualPreference: SexualPreference
  isSexualPreferencePublic: boolean
  biography: string
  interests: string[]
  location: {
    city: string
    neighborhood: string
  }
  fameRating: number
  isOnline: boolean
  lastConnection: string
  photos: MatchaPhoto[]
  relationship: RelationshipState
  currentUserHasProfilePicture: boolean
}

export interface PrivateProfilePerson {
  id: string
  firstName: string
  username: string
  avatarUrl: string
  age: number
  city: string
  fameRating: number
  occurredAt: string
}

export interface PrivateActivityItem {
  id: string
  label: string
  detail: string
  occurredAt: string
}

export interface PrivateMatchaProfile {
  id: string
  coverUrl: string
  firstName: string
  lastName: string
  username: string
  email: string
  age: number
  gender: Gender
  sexualPreference: Exclude<SexualPreference, "Not public">
  biography: string
  interests: string[]
  fameRating: number
  photos: MatchaPhoto[]
  location: {
    gpsConsent: boolean
    city: string
    neighborhood: string
    manualFallback: string
  }
  completion: {
    percent: number
    missingItems: string[]
  }
  visitors: PrivateProfilePerson[]
  likesReceived: PrivateProfilePerson[]
  matches: PrivateProfilePerson[]
  recentActivity: PrivateActivityItem[]
}
