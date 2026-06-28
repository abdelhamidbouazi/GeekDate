"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Loader2, LocateFixed } from "lucide-react"
import { InterestsField } from "@/app/verify/interests-field"
import type { GetInterestsDto } from "@/lib/services/browse-api"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SettingsSection } from "@/components/settings/settings-section"
import { settingsApi } from "@/lib/api/settings"
import type { ProfileFormState } from "@/types/settings"

const GENDER_OPTIONS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
]

const PREFERRED_GENDER_OPTIONS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
]

interface ProfileSettingsTabProps {
  profile: ProfileFormState
  interests: GetInterestsDto[]
  interestsLoading: boolean
  error: string | null
  saving: boolean
  onChange: (patch: Partial<ProfileFormState>) => void
  onToggleInterest: (id: string) => void
  onInterestCreated: (item: { id: string; name: string }) => void
  onInterestError: (message: string) => void
  onSave: () => void
}

export function ProfileSettingsTab({
  profile,
  interests,
  interestsLoading,
  error,
  saving,
  onChange,
  onToggleInterest,
  onInterestCreated,
  onInterestError,
  onSave,
}: ProfileSettingsTabProps) {
  const [locating, setLocating] = useState(false)

  const handleDetectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    setLocating(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 0,
          enableHighAccuracy: false,
        })
      })
      const { latitude, longitude } = position.coords

      // Save coordinates to backend
      await settingsApi.setLocation(latitude, longitude)

      // Reverse-geocode to fill city + country in the form (Nominatim, no API key)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "Accept-Language": "en" } }
      )
      if (res.ok) {
        const data = (await res.json()) as {
          address?: Record<string, string>
        }
        const addr = data.address ?? {}
        const city =
          addr.city ?? addr.town ?? addr.village ?? addr.county ?? ""
        const country = addr.country ?? ""
        onChange({ city, country })
      }

      toast.success("Location updated")
    } catch (err) {
      if (
        typeof GeolocationPositionError !== "undefined" &&
        err instanceof GeolocationPositionError &&
        err.code === err.PERMISSION_DENIED
      ) {
        toast.error("Location access was denied. Allow it in your browser settings.")
      } else {
        toast.error("Could not detect your location")
      }
    } finally {
      setLocating(false)
    }
  }, [onChange])

  return (
    <SettingsSection
      title="Profile"
      description="Update how others see you on SparkDates."
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-first-name">First name</FieldLabel>
            <Input
              id="settings-first-name"
              value={profile.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-last-name">Last name</FieldLabel>
            <Input
              id="settings-last-name"
              value={profile.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="settings-bio">Bio</FieldLabel>
          <Textarea
            id="settings-bio"
            rows={4}
            maxLength={500}
            placeholder="Tell others about yourself..."
            value={profile.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            {profile.bio.length}/500 characters
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Gender</FieldLabel>
            <Select
              value={profile.gender}
              onValueChange={(v) => onChange({ gender: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Sexual preferences</FieldLabel>
            <Select
              value={profile.sexualPreference}
              onValueChange={(v) => onChange({ sexualPreference: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                {PREFERRED_GENDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-age">Age</FieldLabel>
            <Input
              id="settings-age"
              value={profile.age}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Age is calculated from your date of birth.
            </p>
          </Field>
        </div>

        {/* Location section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Location</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectLocation}
              disabled={locating || saving}
              className="gap-1.5 h-8 text-xs"
            >
              {locating
                ? <Loader2 className="size-3.5 animate-spin" />
                : <LocateFixed className="size-3.5" />
              }
              {locating ? "Detecting…" : "Detect my location"}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="settings-city">City</FieldLabel>
              <Input
                id="settings-city"
                placeholder="e.g. Casablanca"
                value={profile.city}
                onChange={(e) => onChange({ city: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-country">Country</FieldLabel>
              <Input
                id="settings-country"
                placeholder="e.g. Morocco"
                value={profile.country}
                onChange={(e) => onChange({ country: e.target.value })}
                readOnly
                className="bg-muted/40 cursor-default"
              />
              <p className="text-xs text-muted-foreground">
                Set automatically via "Detect my location"
              </p>
            </Field>
          </div>
        </div>

        <Field>
          <InterestsField
            interests={interests}
            loading={interestsLoading}
            selectedIds={profile.interestIds}
            onToggle={onToggleInterest}
            onInterestCreated={onInterestCreated}
            onRequestError={onInterestError}
          />
        </Field>
      </FieldGroup>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </SettingsSection>
  )
}
