"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/settings/settings-section"
import type { SecuritySettings } from "@/types/settings"

interface SecuritySettingsTabProps {
  security: SecuritySettings
  onSecurityChange: (patch: Partial<SecuritySettings>) => void
}

export function SecuritySettingsTab({
  security,
  onSecurityChange,
}: SecuritySettingsTabProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!currentPassword) {
      setError("Please enter your current password")
      return
    }

    toast.info(
      "In-app password change is not available yet. Use forgot password to reset via email.",
      {
        action: {
          label: "Reset password",
          onClick: () => {},
        },
      }
    )
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    onSecurityChange({ twoFactorEnabled: enabled })
    toast.info("Two-factor authentication is coming soon.")
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Change password"
        description="Update your password to keep your account secure."
      >
        <form onSubmit={handlePasswordSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current-password">Current password</FieldLabel>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled
              />
            </Field>
          </FieldGroup>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled>
              Update password
            </Button>
            <Button variant="link" className="px-0" asChild>
              <Link href="/forgot-password">Forgot password?</Link>
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Two-factor authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 px-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="two-factor" className="text-sm font-medium">
              Enable 2FA
            </Label>
            <p className="text-sm text-muted-foreground">
              Require a verification code when signing in.
              {" "}Not available in backend yet.
            </p>
          </div>
          <Switch
            id="two-factor"
            checked={security.twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
            disabled
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Active sessions"
        description="Devices where you are currently signed in."
      >
        <p className="text-sm text-muted-foreground">
          Not available in backend yet.
        </p>
      </SettingsSection>
    </div>
  )
}
