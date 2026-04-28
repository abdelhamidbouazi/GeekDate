export const Gender = {
  Unknown: 0,
  Male: 1,
  Female: 2,
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const SexualPreferences = {
  None: 0,
  Male: 1,
  Female: 2,
  Unknown: 3,
} as const;
export type SexualPreferences = (typeof SexualPreferences)[keyof typeof SexualPreferences];

export const NotificationType = {
  Like: 1,
  ProfileVisit: 2,
  Message: 3,
  Match: 4,
  Unlike: 5,
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const SearchSortBy = {
  Age: 0,
  Distance: 1,
  FameRating: 2,
  CommonTags: 3,
} as const;
export type SearchSortBy = (typeof SearchSortBy)[keyof typeof SearchSortBy];

export interface ApiResponse<T> {
  isSucceeded: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  userName: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  accessToken: string;
  refreshToken: string;
  profilePhotoUrl: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  message: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  error: string;
}

export interface UserDto {
  userName: string;
  pictureUrl: string;
  notificationCount: number;
  unreadMessagesCount: number;
}

export interface Photo {
  id: string;
  url: string;
  isMain: boolean;
  publicId: string;
  userId: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface UserInterest {
  id: string;
  userId: string;
  interestId: string;
  name?: string;
}

export interface ConnectedUserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  gender: Gender;
  dateOfBirth: string | null;
  biography: string;
  preferredGender: SexualPreferences;
  interests: Interest[];
  profileViews: number;
  city: string;
  country: string;
  pictures: Photo[];
  userLikes: number;
  emailConfirmed: boolean;
  isBasicInfoComplete: boolean;
  isPreferencesComplete: boolean;
  isProfileCompleted: boolean;
  fameRating: number;
  latitude: number;
  longitude: number;
}

export interface GetUserProfileById {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  gender: Gender;
  dateOfBirth: string;
  knownAs?: string;
  biography?: string;
  lookingFor?: string;
  interests: UserInterest[];
  sexualPreferences: SexualPreferences;
  city?: string;
  country?: string;
  photos: Photo[];
  lastActive: string;
  fameRating: number;
  isLikedByMe: boolean;
  isLikedByThem: boolean;
  isMatched: boolean;
}

export interface BrowseUser {
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

export interface SearchPreferences {
  minAge: number;
  maxAge: number;
  minFameRating: number;
  maxFameRating: number;
  maxDistanceKm: number | null;
  savedInterestIds: string[];
  sortBy: SearchSortBy;
  sortDescending: boolean;
  isFirstTime: boolean;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  unreadCount: number;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  messageText: string;
  sentAt: string;
  updatedAt?: string;
  isRead: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  sentAt: string;
  isRead: boolean;
}

export interface RealtimeNotification {
  type: NotificationType;
  fromUser: string;
  conversationId: string | null;
  message: string;
  timestamp: string;
}

export interface UserProfileViewer {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  profilePicture: string;
}

export interface UserProfileLiked {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  profilePicture: string;
}

export interface ImageDto {
  id: string;
  url: string;
  isMain: boolean;
  publicId: string;
}
