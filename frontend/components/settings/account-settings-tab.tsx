"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SettingsSection } from "@/components/settings/settings-section"
import type { AccountSettings } from "@/types/settings"

interface AccountSettingsTabProps {
  account: AccountSettings
  error: string | null
  saving: boolean
  onChange: (patch: Partial<AccountSettings>) => void
  onSave: () => void
}

export function AccountSettingsTab({
  account,
  error,
  saving,
  onChange,
  onSave,
}: AccountSettingsTabProps) {
  return (
    <SettingsSection
      title="Account"
      description="Manage your login credentials and contact info."
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-account-first-name">First name</FieldLabel>
            <Input
              id="settings-account-first-name"
              value={account.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-account-last-name">Last name</FieldLabel>
            <Input
              id="settings-account-last-name"
              value={account.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="settings-email">Email</FieldLabel>
          <Input
            id="settings-email"
            type="email"
            value={account.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-username">Username</FieldLabel>
          <Input
            id="settings-username"
            value={account.username}
            disabled
            className="bg-muted/50"
          />
          <p className="text-xs text-muted-foreground">
            Username cannot be changed at this time.
          </p>
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-phone">Phone number</FieldLabel>
          <Input
            id="settings-phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={account.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Not available in backend yet.
          </p>
        </Field>
      </FieldGroup>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </SettingsSection>
  )
}
