"use client"

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
import type { ProfileFormState } from "@/types/settings"

const GENDER_OPTIONS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
]

const PREFERRED_GENDER_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
  { value: "3", label: "Unknown" },
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
          <Field>
            <FieldLabel htmlFor="settings-city">Location (city)</FieldLabel>
            <Input
              id="settings-city"
              value={profile.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </Field>
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
