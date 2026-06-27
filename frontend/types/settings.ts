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
