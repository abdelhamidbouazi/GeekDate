"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/settings/settings-section"
import type { PrivacySettings } from "@/types/settings"

interface PrivacySettingsTabProps {
  privacy: PrivacySettings
  saving: boolean
  onChange: (patch: Partial<PrivacySettings>) => void
  onSave: () => void
}

function PrivacyToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 px-4 py-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

export function PrivacySettingsTab({
  privacy,
  saving,
  onChange,
  onSave,
}: PrivacySettingsTabProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Privacy"
        description="Control who can see your profile and activity."
      >
        <div className="space-y-3">
          <PrivacyToggle
            id="profile-visibility"
            label="Profile visibility"
            description="Make your profile visible to other users."
            checked={privacy.profileVisibility}
            onCheckedChange={(v) => onChange({ profileVisibility: v })}
            disabled
          />
          <PrivacyToggle
            id="show-distance"
            label="Show distance"
            description="Display approximate distance on your profile."
            checked={privacy.showDistance}
            onCheckedChange={(v) => onChange({ showDistance: v })}
            disabled
          />
          <PrivacyToggle
            id="show-online"
            label="Show online status"
            description="Let others see when you are online."
            checked={privacy.showOnlineStatus}
            onCheckedChange={(v) => onChange({ showOnlineStatus: v })}
            disabled
          />
          <PrivacyToggle
            id="visit-tracking"
            label="Allow profile visit tracking"
            description="Track who views your profile."
            checked={privacy.allowVisitTracking}
            onCheckedChange={(v) => onChange({ allowVisitTracking: v })}
            disabled
          />
        </div>
        <p className="text-sm text-muted-foreground">Not available in backend yet.</p>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} variant="outline">
            {saving ? "Saving..." : "Save privacy settings"}
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Blocked users"
        description="Manage users you have blocked."
      >
        <p className="text-sm text-muted-foreground">
          Not available in backend yet. Block someone from their profile page.
        </p>
      </SettingsSection>
    </div>
  )
}
