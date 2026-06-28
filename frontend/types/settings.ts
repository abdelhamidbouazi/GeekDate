export interface AccountSettings {
  firstName: string
  lastName: string
  email: string
  username: string
  phone: string
}

export interface ProfileFormState {
  firstName: string
  lastName: string
  bio: string
  gender: string
  sexualPreference: string
  age: string
  city: string
  country: string
  interestIds: string[]
}

export interface PrivacySettings {
  profileVisibility: boolean
  showDistance: boolean
  showOnlineStatus: boolean
  allowVisitTracking: boolean
}

export interface NotificationSettings {
  likes: boolean
  matches: boolean
  messages: boolean
  profileVisits: boolean
  email: boolean
  push: boolean
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
}

export interface SettingsState {
  account: AccountSettings
  profile: ProfileFormState
  privacy: PrivacySettings
  notifications: NotificationSettings
  security: SecuritySettings
}

export const SETTINGS_STORAGE_KEY = "geekdate-settings"

export const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: true,
  showDistance: true,
  showOnlineStatus: true,
  allowVisitTracking: true,
}

export const defaultNotificationSettings: NotificationSettings = {
  likes: true,
  matches: true,
  messages: true,
  profileVisits: true,
  email: true,
  push: false,
}

export const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
}

export interface SettingsSectionAvailability {
  available: boolean
  label: string
  description: string
}

export interface SettingsPhoto {
  id: string
  userId: string
  url: string
  isMain: boolean
  publicId: string
}

export interface SettingsConnectedProfile {
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
  pictures: SettingsPhoto[]
  userLikes: number
  emailConfirmed: boolean
  isBasicInfoComplete: boolean
  isPreferencesComplete: boolean
  isProfileCompleted: boolean
  fameRating: number
  latitude: number
  longitude: number
}

export interface SettingsAccountDraft {
  firstName: string
  lastName: string
  username: string
  email: string
}

export interface SettingsProfileDraft {
  dateOfBirth: string
  gender: string
  sexualPreference: string
  biography: string
  city: string
  interestIds: string[]
}

export interface SettingsLocationDraft {
  city: string
  latitude: string
  longitude: string
}

export type SettingsPanelKey =
  | "account"
  | "profile"
  | "photos"
  | "location"
  | "security"
  | "privacy"
  | "notifications"
  | "danger"
