"use client"

import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Settings, Bell, Shield, User, Globe } from "lucide-react"

export default function SettingsPage() {
  return (
    <AuthenticatedShell>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-gray-500/10 p-3">
                    <Settings className="size-6 text-gray-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                      Manage your account settings and preferences.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="size-5" />
                        <CardTitle>Account</CardTitle>
                      </div>
                      <CardDescription>Manage your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <input
                          type="email"
                          defaultValue="user@geekdate.com"
                          className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Button variant="outline" className="w-full mt-1">Change Password</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bell className="size-5" />
                        <CardTitle>Notifications</CardTitle>
                      </div>
                      <CardDescription>Control your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>New Matches</Label>
                          <p className="text-sm text-muted-foreground">Get notified when you have a new match</p>
                        </div>
                        <input type="checkbox" defaultChecked className="size-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Messages</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                        </div>
                        <input type="checkbox" defaultChecked className="size-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Profile Views</Label>
                          <p className="text-sm text-muted-foreground">Get notified when someone views your profile</p>
                        </div>
                        <input type="checkbox" defaultChecked className="size-4" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Shield className="size-5" />
                        <CardTitle>Privacy</CardTitle>
                      </div>
                      <CardDescription>Manage your privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Online Status</Label>
                          <p className="text-sm text-muted-foreground">Let others see when you&apos;re online</p>
                        </div>
                        <input type="checkbox" defaultChecked className="size-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Profile to Everyone</Label>
                          <p className="text-sm text-muted-foreground">Make your profile visible to all users</p>
                        </div>
                        <input type="checkbox" defaultChecked className="size-4" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Globe className="size-5" />
                        <CardTitle>Preferences</CardTitle>
                      </div>
                      <CardDescription>Customize your experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Language</Label>
                        <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm">
                          <option>English</option>
                          <option>French</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                      <div>
                        <Label>Distance Range</Label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          defaultValue="50"
                          className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 km</span>
                          <span>50 km</span>
                          <span>100 km</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </AuthenticatedShell>
  )
}
