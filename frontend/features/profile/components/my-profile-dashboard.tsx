"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Camera,
  Check,
  Edit,
  Eye,
  Heart,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Star,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { browseApi, type GetInterestsDto } from "@/lib/services/browse-api"
import {
  profileApi,
  profileSummaryDisplayName,
  profileSummaryLocation,
  profileViewerDisplayName,
  resolveProfileMediaUrl,
  type ProfileSummaryUser,
  type ProfileViewerUser,
} from "@/lib/services/profile-api"
import { calculateAge } from "@/lib/utils/profile"
import { dedupeProfilePhotos, extractInterestIds } from "@/lib/utils/profile-view"
import { useMyProfile } from "@/features/profile/hooks/use-my-profile"

type EditState = {
  firstName: string
  lastName: string
  email: string
  gender: string
  sexualPreferences: string
  biography: string
  city: string
  interestIds: string[]
}

function genderLabel(value: number | string): string {
  const n = Number(value)
  if (n === 1) return "Man"
  if (n === 2) return "Woman"
  return "Not specified"
}

function preferenceLabel(value: number | string): string {
  const n = Number(value)
  if (n === 1) return "Men"
  if (n === 2) return "Women"
  if (n === 3) return "Everyone"
  return "Not specified"
}

function interestId(item: GetInterestsDto): string | null {
  const id = item.id ?? item.Id
  return id ? String(id) : null
}

function interestName(item: GetInterestsDto): string {
  return item.name ?? item.Name ?? ""
}

function ProfileStudioSkeleton() {
  return (
    <AuthenticatedShell>
      <div className="space-y-5 p-4 lg:p-6">
        <Skeleton className="h-64 rounded-lg" />
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    </AuthenticatedShell>
  )
}

export function MyProfileDashboard() {
  const {
    user,
    profileViews,
    profileLikes,
    mutualMatches,
    loading,
    error,
    uploading,
    fileInputRef,
    userId,
    fetchProfile,
    fetchActivity,
    handleUploadPhoto,
    handleSetMainPhoto,
    handleDeletePhoto,
    activity,
  } = useMyProfile()

  const dialogFileInputRef = useRef<HTMLInputElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [interests, setInterests] = useState<GetInterestsDto[]>([])
  const [interestsLoading, setInterestsLoading] = useState(false)
  const [edit, setEdit] = useState<EditState>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "0",
    sexualPreferences: "0",
    biography: "",
    city: "",
    interestIds: [],
  })

  const photos = useMemo(() => dedupeProfilePhotos(user?.photos ?? []).slice(0, 5), [user?.photos])
  const mainPhoto = photos.find((photo) => photo.isMain) ?? photos[0]
  const age = calculateAge(user?.dateOfBirth ?? null)
  const location = [user?.city, user?.country].filter(Boolean).join(", ") || "Location not set"
  const hasGps = Boolean(user?.latitude && user?.longitude)
  const selectedInterestNames = useMemo(() => {
    const names = new Map(interests.map((item) => [interestId(item), interestName(item)]))
    return (user?.interests ?? [])
      .map((item) => item.interest?.name ?? names.get(item.interestId) ?? item.interestId)
      .filter(Boolean)
  }, [interests, user?.interests])

  const completion = useMemo(() => {
    if (!user) return { percent: 0, missing: ["profile"] }
    const checks = [
      { ok: Boolean(user.firstName), label: "first name" },
      { ok: Boolean(user.lastName), label: "last name" },
      { ok: Boolean(user.email), label: "email" },
      { ok: Boolean(user.biography), label: "bio" },
      { ok: photos.length > 0, label: "photo" },
      { ok: selectedInterestNames.length > 0, label: "interests" },
      { ok: Boolean(user.city || hasGps), label: "location" },
    ]
    const done = checks.filter((item) => item.ok).length
    return {
      percent: Math.round((done / checks.length) * 100),
      missing: checks.filter((item) => !item.ok).map((item) => item.label),
    }
  }, [hasGps, photos.length, selectedInterestNames.length, user])

  useEffect(() => {
    if (!user) return
    setEdit({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      gender: String(user.gender ?? 0),
      sexualPreferences: String(user.lookingFor ?? user.preferredGender ?? 0),
      biography: user.biography ?? "",
      city: user.city ?? "",
      interestIds: extractInterestIds(user),
    })
  }, [user])

  useEffect(() => {
    setInterestsLoading(true)
    browseApi
      .getInterests()
      .then(setInterests)
      .catch(() => setInterests([]))
      .finally(() => setInterestsLoading(false))
  }, [])

  async function saveProfile() {
    if (!userId) return
    if (!edit.firstName.trim() || !edit.lastName.trim() || !edit.email.trim()) {
      toast.error("First name, last name, and email are required.")
      return
    }
    setSaving(true)
    try {
      await profileApi.updateProfile({
        userId,
        firstName: edit.firstName.trim(),
        lastName: edit.lastName.trim(),
        email: edit.email.trim(),
        gender: Number(edit.gender) || 0,
        biography: edit.biography.trim(),
        sexualPreferences: Number(edit.sexualPreferences) || 0,
        userInterestIds: edit.interestIds,
        city: edit.city.trim(),
      })
      await Promise.all([fetchProfile(), fetchActivity()])
      toast.success("Profile updated")
      setEditOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile")
    } finally {
      setSaving(false)
    }
  }

  function toggleInterest(id: string) {
    setEdit((current) => ({
      ...current,
      interestIds: current.interestIds.includes(id)
        ? current.interestIds.filter((item) => item !== id)
        : [...current.interestIds, id],
    }))
  }

  if (loading && !user) return <ProfileStudioSkeleton />

  if (error && !user) {
    return (
      <AuthenticatedShell>
        <div className="grid min-h-[60vh] place-items-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle>Profile could not be loaded</AlertTitle>
            <AlertDescription className="mt-2">{error}</AlertDescription>
          </Alert>
        </div>
      </AuthenticatedShell>
    )
  }

  if (!user) return null

  return (
    <AuthenticatedShell>
      <main className="min-h-screen bg-background">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadPhoto}
        />
        <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
          <section className="relative overflow-hidden rounded-lg border bg-card">
            <div className="absolute inset-0 h-44 bg-gradient-to-r from-zinc-950 via-zinc-800 to-stone-700" />
            {mainPhoto ? (
              <Image
                src={resolveProfileMediaUrl(mainPhoto.url)}
                alt={`${user.firstName} profile cover`}
                fill
                className="object-cover opacity-20"
                sizes="1200px"
              />
            ) : null}
            <div className="relative space-y-6 p-5 pt-24 lg:p-8 lg:pt-28">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <Avatar className="size-28 rounded-lg border-4 border-background shadow-xl lg:size-36">
                    <AvatarImage src={resolveProfileMediaUrl(mainPhoto?.url ?? user.photoProfileUrl)} />
                    <AvatarFallback className="rounded-lg">
                      <User className="size-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Profile Studio
                      </p>
                      <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.userName}
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline">@{user.userName}</Badge>
                      {age != null && <Badge variant="outline">{age} years old</Badge>}
                      <Badge variant="outline">{genderLabel(user.gender)}</Badge>
                      <Badge variant="outline">{preferenceLabel(user.lookingFor ?? user.preferredGender)}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || photos.length >= 5}
                  >
                    {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ImagePlus className="mr-2 size-4" />}
                    Upload photo
                  </Button>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Edit className="mr-2 size-4" />
                        Edit profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[92vh] max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[68vh] pr-4">
                        <div className="space-y-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="First name" value={edit.firstName} onChange={(value) => setEdit((s) => ({ ...s, firstName: value }))} />
                            <Field label="Last name" value={edit.lastName} onChange={(value) => setEdit((s) => ({ ...s, lastName: value }))} />
                            <Field label="Email" value={edit.email} onChange={(value) => setEdit((s) => ({ ...s, email: value }))} />
                            <Field label="City / neighborhood" value={edit.city} onChange={(value) => setEdit((s) => ({ ...s, city: value }))} />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Gender</Label>
                              <Select value={edit.gender} onValueChange={(value) => setEdit((s) => ({ ...s, gender: value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Not specified</SelectItem>
                                  <SelectItem value="1">Man</SelectItem>
                                  <SelectItem value="2">Woman</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Sexual preferences</Label>
                              <Select value={edit.sexualPreferences} onValueChange={(value) => setEdit((s) => ({ ...s, sexualPreferences: value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Not specified</SelectItem>
                                  <SelectItem value="1">Men</SelectItem>
                                  <SelectItem value="2">Women</SelectItem>
                                  <SelectItem value="3">Everyone</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Biography</Label>
                            <Textarea
                              value={edit.biography}
                              onChange={(event) => setEdit((s) => ({ ...s, biography: event.target.value }))}
                              rows={5}
                              maxLength={800}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label>Interests</Label>
                            {interestsLoading ? (
                              <p className="text-sm text-muted-foreground">Loading interests...</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {interests.map((item) => {
                                  const id = interestId(item)
                                  const name = interestName(item)
                                  if (!id || !name) return null
                                  const active = edit.interestIds.includes(id)
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => toggleInterest(id)}
                                      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                        active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                                      }`}
                                    >
                                      {name}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
                          Cancel
                        </Button>
                        <Button onClick={saveProfile} disabled={saving}>
                          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
                          Save profile
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <Metric icon={Star} label="Fame rating" value={user.fameRating ?? 0} />
                <Metric icon={Eye} label="Visitors" value={profileViews.length} />
                <Metric icon={Heart} label="Likes received" value={profileLikes.length} />
                <Metric icon={Users} label="Matches" value={mutualMatches.length} />
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <Card className="rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Photo set</CardTitle>
                  <Badge variant="outline">{photos.length}/5 photos</Badge>
                </CardHeader>
                <CardContent>
                  {photos.length === 0 ? (
                    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                      <div>
                        <Camera className="mx-auto mb-2 size-6" />
                        Add at least one picture to unlock the full Matcha experience.
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {photos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
                          <Image src={resolveProfileMediaUrl(photo.url)} alt="Profile photo" fill className="object-cover" sizes="180px" />
                          <div className="absolute inset-x-2 top-2 flex justify-between gap-2">
                            {photo.isMain ? <Badge className="bg-black/65 text-white">Main</Badge> : <span />}
                          </div>
                          <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            {!photo.isMain && (
                              <Button size="sm" variant="secondary" className="h-8 flex-1" onClick={() => handleSetMainPhoto(photo.id)}>
                                Main
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => handleDeletePhoto(photo.id)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <input ref={dialogFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Complete profile details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  <Detail label="First name" value={user.firstName} />
                  <Detail label="Last name" value={user.lastName} />
                  <Detail label="Username" value={`@${user.userName}`} />
                  <Detail label="Email" value={user.email} />
                  <Detail label="Age" value={age != null ? `${age}` : "Not set"} />
                  <Detail label="Gender" value={genderLabel(user.gender)} />
                  <Detail label="Sexual preferences" value={preferenceLabel(user.lookingFor ?? user.preferredGender)} />
                  <Detail label="Approximate location" value={location} />
                  <div className="md:col-span-2">
                    <Detail label="Biography" value={user.biography || "Not set"} />
                  </div>
                  <div className="md:col-span-2">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterestNames.length > 0 ? (
                        selectedInterestNames.map((interest) => <Badge key={interest} variant="secondary">{interest}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">No interests selected.</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 md:grid-cols-3">
                <PeoplePanel title="Visitors" people={profileViews} empty="No profile visitors yet." kind="viewer" />
                <PeoplePanel title="Likes received" people={profileLikes} empty="No likes received yet." kind="summary" />
                <PeoplePanel title="Matches" people={mutualMatches} empty="No matches yet." kind="summary" matched />
              </div>
            </div>

            <aside className="space-y-5">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Profile completion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <strong>{completion.percent}%</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${completion.percent}%` }} />
                    </div>
                  </div>
                  {completion.missing.length > 0 ? (
                    <p className="text-sm text-muted-foreground">Missing: {completion.missing.join(", ")}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Your profile has all core Matcha fields.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Location status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <StatusRow icon={Navigation} label="GPS consent" value={hasGps ? "Granted" : "Manual / not granted"} />
                  <StatusRow icon={MapPin} label="Approximate place" value={location} />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Public profiles only show approximate city or neighborhood, never exact GPS coordinates.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent profile activity yet.</p>
                  ) : (
                    activity.slice(0, 8).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <Avatar className="size-9">
                          <AvatarImage src={item.avatar} />
                          <AvatarFallback><User className="size-4" /></AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.user}</p>
                          <p className="text-xs text-muted-foreground">{item.action}</p>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </main>
    </AuthenticatedShell>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background/85 p-4">
      <Icon className="mb-3 size-4 text-muted-foreground" />
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm">{value}</p>
    </div>
  )
}

function StatusRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

function PeoplePanel({
  title,
  people,
  empty,
  kind,
  matched = false,
}: {
  title: string
  people: Array<ProfileViewerUser | ProfileSummaryUser>
  empty: string
  kind: "viewer" | "summary"
  matched?: boolean
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          people.slice(0, 6).map((person, index) => {
            const summary = person as ProfileSummaryUser
            const name =
              kind === "summary"
                ? profileSummaryDisplayName(summary)
                : profileViewerDisplayName(person)
            const location = kind === "summary" ? profileSummaryLocation(summary) : null
            const href = person.id ? `/users/${person.id}` : null
            return (
              <div key={person.id || index} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <Avatar className="size-10">
                  <AvatarImage src={resolveProfileMediaUrl(person.profilePicture)} />
                  <AvatarFallback><User className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{location || (person.age ? `${person.age} years old` : "SparkDates member")}</p>
                </div>
                {href && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={href}>View</Link>
                  </Button>
                )}
                {matched && (
                  <Button size="icon" variant="ghost" asChild>
                    <Link href="/messages"><MessageCircle className="size-4" /></Link>
                  </Button>
                )}
              </div>
            )
          })
        )}
        {people.length > 6 && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">Showing latest 6 of {people.length}.</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
