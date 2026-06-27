"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { browseApi, type GetInterestsDto } from "@/lib/services/browse-api"
import {
  profileApi,
  getUserIdFromToken,
  type AppUser,
} from "@/lib/services/profile-api"
import { calculateAge } from "@/lib/utils/profile"
import { extractInterestIds } from "@/lib/utils/profile-view"
import {
  defaultNotificationSettings,
  defaultPrivacySettings,
  defaultSecuritySettings,
  type AccountSettings,
  type NotificationSettings,
  type PrivacySettings,
  type ProfileFormState,
  type SecuritySettings,
} from "@/types/settings"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mapUserToAccount(user: AppUser): AccountSettings {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    username: user.userName ?? "",
    phone: "",
  }
}

function mapUserToProfile(user: AppUser): ProfileFormState {
  const age = calculateAge(user.dateOfBirth)
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    bio: user.biography ?? "",
    gender: String(user.gender ?? "0"),
    sexualPreference: String(user.lookingFor ?? user.preferredGender ?? "0"),
    age: age != null ? String(age) : "",
    city: user.city ?? "",
    country: user.country ?? "",
    interestIds: extractInterestIds(user),
  }
}

export function useSettingsForm() {
  const userId = getUserIdFromToken()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)

  const [account, setAccount] = useState<AccountSettings>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
  })
  const [profile, setProfile] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    bio: "",
    gender: "0",
    sexualPreference: "0",
    age: "",
    city: "",
    country: "",
    interestIds: [],
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>(defaultPrivacySettings)
  const [notifications, setNotifications] = useState<NotificationSettings>(
    defaultNotificationSettings
  )
  const [security, setSecurity] = useState<SecuritySettings>(
    defaultSecuritySettings
  )

  const [interests, setInterests] = useState<GetInterestsDto[]>([])
  const [interestsLoading, setInterestsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [userData, interestsData] = await Promise.all([
        profileApi.getUser(userId),
        browseApi.getInterests().catch(() => []),
      ])
      setUser(userData)
      setAccount(mapUserToAccount(userData))
      setProfile(mapUserToProfile(userData))
      setInterests(interestsData)

      setPrivacy(defaultPrivacySettings)
      setNotifications(defaultNotificationSettings)
      setSecurity(defaultSecuritySettings)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setLoading(false)
      setInterestsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const buildUpdatePayload = useCallback(
    (overrides?: Partial<ProfileFormState & AccountSettings>) => {
      if (!userId || !user) return null
      const p = { ...profile, ...overrides }
      const a = { ...account, ...overrides }
      return {
        userId,
        firstName: (a.firstName || p.firstName).trim(),
        lastName: (a.lastName || p.lastName).trim(),
        email: a.email.trim(),
        gender: parseInt(p.gender, 10) || 0,
        biography: p.bio.trim(),
        sexualPreferences: parseInt(p.sexualPreference, 10) || 0,
        userInterestIds: p.interestIds,
        city: p.city.trim(),
      }
    },
    [userId, user, profile, account]
  )

  const saveAccount = useCallback(async () => {
    setAccountError(null)
    if (!EMAIL_REGEX.test(account.email.trim())) {
      setAccountError("Please enter a valid email address")
      return
    }
    const payload = buildUpdatePayload()
    if (!payload) return

    setSaving(true)
    try {
      await profileApi.updateProfile(payload)
      toast.success("Account settings saved")
      await loadUser()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save account"
      setAccountError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [account, buildUpdatePayload, loadUser])

  const saveProfile = useCallback(async () => {
    setProfileError(null)
    if (profile.firstName.trim().length < 2) {
      setProfileError("First name must be at least 2 characters")
      return
    }
    if (profile.lastName.trim().length < 2) {
      setProfileError("Last name must be at least 2 characters")
      return
    }
    if (profile.bio.length > 500) {
      setProfileError("Bio must be 500 characters or less")
      return
    }

    const payload = buildUpdatePayload()
    if (!payload) return

    setSaving(true)
    try {
      await profileApi.updateProfile(payload)
      toast.success("Profile updated")
      await loadUser()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile"
      setProfileError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [profile, buildUpdatePayload, loadUser])

  const savePrivacy = useCallback(async () => {
    setSaving(true)
    try {
      toast.info("Privacy settings are not available in backend yet.")
    } finally {
      setSaving(false)
    }
  }, [])

  const saveNotifications = useCallback(async () => {
    setSaving(true)
    try {
      toast.info("Notification settings are not available in backend yet.")
    } finally {
      setSaving(false)
    }
  }, [])

  const toggleInterest = useCallback((id: string) => {
    setProfile((prev) => {
      const exists = prev.interestIds.includes(id)
      return {
        ...prev,
        interestIds: exists
          ? prev.interestIds.filter((x) => x !== id)
          : [...prev.interestIds, id],
      }
    })
  }, [])

  const addInterest = useCallback((item: { id: string; name: string }) => {
    setInterests((prev) => [...prev, { id: item.id, name: item.name }])
    setProfile((prev) => ({
      ...prev,
      interestIds: prev.interestIds.includes(item.id)
        ? prev.interestIds
        : [...prev.interestIds, item.id],
    }))
  }, [])

  return {
    loading,
    saving,
    account,
    profile,
    privacy,
    notifications,
    security,
    interests,
    interestsLoading,
    accountError,
    profileError,
    setAccount,
    setProfile,
    setPrivacy,
    setNotifications,
    setSecurity,
    saveAccount,
    saveProfile,
    savePrivacy,
    saveNotifications,
    toggleInterest,
    addInterest,
  }
}
