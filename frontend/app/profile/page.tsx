"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Edit,
  MapPin,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Camera,
  Settings,
  Star,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Activity,
} from "lucide-react"
import Image from "next/image"
import {
  profileApi,
  getUserIdFromToken,
  type AppUser,
  type UserProfileView,
} from "@/lib/profile-api"

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23999' width='400' height='400'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3ENo photo%3C/text%3E%3C/svg%3E"

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return `Joined ${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
  } catch {
    return ""
  }
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  try {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--
    }
    return age
  } catch {
    return null
  }
}

function formatActivityTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ""
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<AppUser | null>(null)
  const [profileViews, setProfileViews] = useState<UserProfileView[]>([])
  const [profileLikes, setProfileLikes] = useState<UserProfileView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userId = getUserIdFromToken()

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    try {
      const data = await profileApi.getUser(userId)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    }
  }, [userId])

  const fetchActivity = useCallback(async () => {
    if (!userId) return
    try {
      const [views, likes] = await Promise.all([
        profileApi.getProfileViews().catch(() => []),
        profileApi.getProfileLikes().catch(() => []),
      ])
      setProfileViews(Array.isArray(views) ? views : [])
      setProfileLikes(Array.isArray(likes) ? likes : [])
    } catch {
      // ignore
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setError("Not authenticated")
      return
    }
    let cancelled = false
    async function init() {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([fetchProfile(), fetchActivity()])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [userId, fetchProfile, fetchActivity])

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    try {
      await profileApi.uploadImage(file)
      await fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleSetMainPhoto = async (photoId: string) => {
    if (!userId) return
    try {
      await profileApi.setMainPhoto(photoId, userId)
      await fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set main photo")
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!userId) return
    try {
      await profileApi.deletePhoto(photoId)
      await fetchProfile()
      setSelectedPhotoIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo")
    }
  }

  const photos = user?.photos ?? []
  const mainPhoto = photos.find((p) => p.isMain) ?? photos[0]
  const displayPhotos = photos.length > 0 ? photos.map((p) => p.url) : [PLACEHOLDER_IMAGE]
  const location = [user?.city, user?.country].filter(Boolean).join(", ") || "Location not set"

  const activity = [
    ...profileLikes.slice(0, 5).map((p, i) => ({
      id: `like-${i}`,
      type: "like" as const,
      user: p.userName,
      action: "liked your profile",
      time: "",
      avatar: p.pictureUrl ?? PLACEHOLDER_IMAGE,
    })),
    ...profileViews.slice(0, 5).map((p, i) => ({
      id: `view-${i}`,
      type: "view" as const,
      user: p.userName,
      action: "viewed your profile",
      time: "",
      avatar: p.pictureUrl ?? PLACEHOLDER_IMAGE,
    })),
  ]

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/login")}>
          Go to login
        </Button>
      </div>
    )
  }

  if (!user) return null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
            <div className="flex flex-col">
              {/* Cover Photo Section */}
              <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: mainPhoto?.url
                      ? `url(${mainPhoto.url})`
                      : undefined,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-4 right-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadPhoto}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="size-4 mr-2" />
                    {uploading ? "Uploading..." : "Edit Cover"}
                  </Button>
                </div>
              </div>

              {/* Profile Header */}
              <div className="relative px-4 lg:px-6 pb-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
                  <div className="relative">
                    <Avatar className="size-32 sm:size-40 border-4 border-background ring-4 ring-background/50">
                      <AvatarImage
                        src={mainPhoto?.url ?? PLACEHOLDER_IMAGE}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>
                        <User className="size-12" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 size-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Camera className="size-4" />
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold">
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.userName || "User"}
                        </h1>
                        {calculateAge(user.dateOfBirth) != null && (
                          <Badge variant="outline" className="text-xs">
                            {calculateAge(user.dateOfBirth)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">@{user.userName}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-4" />
                          <span>{location}</span>
                        </div>
                        {user.createdAt && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="size-4 mr-2" />
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </div>

                {user.biography && (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed">{user.biography}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{profileViews.length}</span>{" "}
                      <span className="text-muted-foreground">profile views</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{profileLikes.length}</span>{" "}
                      <span className="text-muted-foreground">likes received</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{user.fameRating ?? 0}</span>{" "}
                      <span className="text-muted-foreground">fame rating</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger value="overview" className="data-[state=active]:border-b-2">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="photos" className="data-[state=active]:border-b-2">
                      <ImageIcon className="size-4 mr-2" />
                      Photos
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:border-b-2">
                      <Activity className="size-4 mr-2" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:border-b-2">
                      <Settings className="size-4 mr-2" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profile Views
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{profileViews.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Likes Received
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{profileLikes.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Fame Rating
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{user.fameRating ?? 0}</div>
                          <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                            <Star className="size-3 fill-current" />
                            <span>Popular</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {user.interests && user.interests.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Interests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {user.interests.map((i) => (
                              <Badge key={i.id} variant="secondary" className="px-3 py-1.5 text-sm">
                                {(i as { interest?: { name: string } }).interest?.name ?? i.interestId}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="photos" className="mt-6">
                    <div className="space-y-6">
                      <div className="relative aspect-[4/5] max-w-2xl mx-auto rounded-2xl overflow-hidden bg-muted">
                        <Image
                          src={displayPhotos[selectedPhotoIndex] ?? PLACEHOLDER_IMAGE}
                          alt={`Photo ${selectedPhotoIndex + 1}`}
                          fill
                          className="object-cover"
                          priority
                          unoptimized={!(displayPhotos[selectedPhotoIndex] ?? "").startsWith("/")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="text-white text-sm font-medium">
                            {displayPhotos.length > 0
                              ? `${selectedPhotoIndex + 1} / ${displayPhotos.length}`
                              : "No photos"}
                          </span>
                          <div className="flex gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadPhoto}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="backdrop-blur-sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                            >
                              <Camera className="size-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {photos.map((photo, index) => (
                          <div key={photo.id} className="relative group">
                            <button
                              onClick={() => setSelectedPhotoIndex(index)}
                              className={`relative aspect-[3/4] w-full rounded-lg overflow-hidden border-2 transition-all ${
                                selectedPhotoIndex === index
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <Image
                                src={photo.url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={!photo.url.startsWith("/")}
                              />
                            </button>
                            <div className="absolute bottom-1 left-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!photo.isMain && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="flex-1 h-7 text-xs"
                                  onClick={() => handleSetMainPhoto(photo.id)}
                                >
                                  Set main
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleDeletePhoto(photo.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activity.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">
                            No recent activity yet.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {activity.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <Avatar className="size-10">
                                  <AvatarImage src={item.avatar} alt={item.user} />
                                  <AvatarFallback>
                                    <User className="size-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{item.user}</span>
                                    <span className="text-muted-foreground">{item.action}</span>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    item.type === "like" ? "secondary" : "outline"
                                  }
                                >
                                  {item.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Manage your profile settings, privacy, and preferences here.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => router.push("/browse")}
                        >
                          <Heart className="size-4 mr-2" />
                          Matching Preferences
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
