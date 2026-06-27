export interface ApiPhoto {
  id: string
  url: string
  publicId?: string
  isMain: boolean
  userId?: string
}

export interface ApiInterest {
  id?: string
  interestId?: string
  name?: string
  interest?: {
    id?: string
    name?: string
  }
}

export interface ApiUser {
  id?: string
  firstName?: string
  lastName?: string
  userName?: string
  username?: string
  email?: string
  gender?: number
  dateOfBirth?: string | null
  biography?: string | null
  lookingFor?: number
  preferredGender?: number
  sexualPreferences?: number
  city?: string | null
  country?: string | null
  photos?: ApiPhoto[]
  interests?: ApiInterest[]
  createdAt?: string
  lastActive?: string
  emailConfirmed?: boolean
  fameRating?: number
  latitude?: number | null
  longitude?: number | null
  photoProfileUrl?: string | null
  pictureUrl?: string | null
  isLikedByMe?: boolean
  isLikedByThem?: boolean
  isMatched?: boolean
}

export interface PublicUserProfile extends ApiUser {
  id: string
}

export interface ProfileSummary {
  id: string
  firstName?: string | null
  lastName?: string | null
  userName?: string | null
  age?: number | null
  city?: string | null
  country?: string | null
  profilePicture?: string | null
  pictureUrl?: string | null
  matchedAt?: string | null
}
