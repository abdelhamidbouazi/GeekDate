"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Bell,
  Loader2,
  Lock,
  Settings,
  Shield,
  User,
  UserCircle,
} from "lucide-react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { AccountSettingsTab } from "@/components/settings/account-settings-tab"
import { DangerZone } from "@/components/settings/danger-zone"
import { NotificationsSettingsTab } from "@/components/settings/notifications-settings-tab"
import { PrivacySettingsTab } from "@/components/settings/privacy-settings-tab"
import { ProfileSettingsTab } from "@/components/settings/profile-settings-tab"
import { SecuritySettingsTab } from "@/components/settings/security-settings-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettingsForm } from "@/features/settings/hooks/use-settings-form"
import { toast } from "sonner"

const TAB_VALUES = [
  "account",
  "profile",
  "privacy",
  "notifications",
  "security",
  "danger",
] as const

function SettingsPageInner() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const defaultTab =
    tabParam && TAB_VALUES.includes(tabParam as (typeof TAB_VALUES)[number])
      ? tabParam
      : "account"

  const {
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
  } = useSettingsForm()

  if (loading) {
    return (
      <AuthenticatedShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AuthenticatedShell>
    )
  }

  return (
    <AuthenticatedShell>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-rose-500/20 to-orange-400/20 p-3">
                  <Settings className="size-6 text-rose-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your account, profile, and preferences.
                  </p>
                </div>
              </div>

              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
                  <TabsTrigger value="account" className="gap-1.5">
                    <User className="size-4" />
                    <span className="hidden sm:inline">Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="gap-1.5">
                    <UserCircle className="size-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="gap-1.5">
                    <Shield className="size-4" />
                    <span className="hidden sm:inline">Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-1.5">
                    <Bell className="size-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-1.5">
                    <Lock className="size-4" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="danger"
                    className="gap-1.5 text-destructive data-[state=active]:text-destructive"
                  >
                    <span className="sm:hidden">!</span>
                    <span className="hidden sm:inline">Danger Zone</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="mt-0">
                  <AccountSettingsTab
                    account={account}
                    error={accountError}
                    saving={saving}
                    onChange={(patch) => setAccount((prev) => ({ ...prev, ...patch }))}
                    onSave={saveAccount}
                  />
                </TabsContent>

                <TabsContent value="profile" className="mt-0">
                  <ProfileSettingsTab
                    profile={profile}
                    interests={interests}
                    interestsLoading={interestsLoading}
                    error={profileError}
                    saving={saving}
                    onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
                    onToggleInterest={toggleInterest}
                    onInterestCreated={addInterest}
                    onInterestError={(msg) => toast.error(msg)}
                    onSave={saveProfile}
                  />
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <PrivacySettingsTab
                    privacy={privacy}
                    saving={saving}
                    onChange={(patch) => setPrivacy((prev) => ({ ...prev, ...patch }))}
                    onSave={savePrivacy}
                  />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <NotificationsSettingsTab
                    notifications={notifications}
                    saving={saving}
                    onChange={(patch) =>
                      setNotifications((prev) => ({ ...prev, ...patch }))
                    }
                    onSave={saveNotifications}
                  />
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <SecuritySettingsTab
                    security={security}
                    onSecurityChange={(patch) =>
                      setSecurity((prev) => ({ ...prev, ...patch }))
                    }
                  />
                </TabsContent>

                <TabsContent value="danger" className="mt-0">
                  <DangerZone />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <AuthenticatedShell>
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </AuthenticatedShell>
      }
    >
      <SettingsPageInner />
    </Suspense>
  )
}
