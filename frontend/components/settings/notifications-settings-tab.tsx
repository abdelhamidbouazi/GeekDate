"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/settings/settings-section"
import type { NotificationSettings } from "@/types/settings"

interface NotificationsSettingsTabProps {
  notifications: NotificationSettings
  saving: boolean
  onChange: (patch: Partial<NotificationSettings>) => void
  onSave: () => void
}

function NotificationToggle({
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

export function NotificationsSettingsTab({
  notifications,
  saving,
  onChange,
  onSave,
}: NotificationsSettingsTabProps) {
  return (
    <SettingsSection
      title="Notifications"
      description="Choose what you want to be notified about."
    >
      <div className="space-y-3">
        <NotificationToggle
          id="notif-likes"
          label="Likes"
          description="When someone likes your profile."
          checked={notifications.likes}
          onCheckedChange={(v) => onChange({ likes: v })}
          disabled
        />
        <NotificationToggle
          id="notif-matches"
          label="Matches"
          description="When you get a new match."
          checked={notifications.matches}
          onCheckedChange={(v) => onChange({ matches: v })}
          disabled
        />
        <NotificationToggle
          id="notif-messages"
          label="Messages"
          description="When you receive a new message."
          checked={notifications.messages}
          onCheckedChange={(v) => onChange({ messages: v })}
          disabled
        />
        <NotificationToggle
          id="notif-visits"
          label="Profile visits"
          description="When someone views your profile."
          checked={notifications.profileVisits}
          onCheckedChange={(v) => onChange({ profileVisits: v })}
          disabled
        />
        <NotificationToggle
          id="notif-email"
          label="Email notifications"
          description="Receive updates via email."
          checked={notifications.email}
          onCheckedChange={(v) => onChange({ email: v })}
          disabled
        />
        <NotificationToggle
          id="notif-push"
          label="Push notifications"
          description="Browser push notifications (coming soon)."
          checked={notifications.push}
          onCheckedChange={(v) => onChange({ push: v })}
          disabled
        />
      </div>
      <p className="text-sm text-muted-foreground">Not available in backend yet.</p>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} variant="outline">
          {saving ? "Saving..." : "Save notification settings"}
        </Button>
      </div>
    </SettingsSection>
  )
}
