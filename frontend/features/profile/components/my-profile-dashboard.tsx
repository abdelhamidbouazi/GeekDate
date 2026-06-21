"use client"

import { useRouter } from "next/navigation"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
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
  Calendar,
  Camera,
  Settings,
  Star,
  Image as ImageIcon,
  Activity,
} from "lucide-react"
import Image from "next/image"
import {
  calculateAge,
  formatJoinedDate,
  PROFILE_PHOTO_PLACEHOLDER,
} from "@/lib/utils/profile"
import { useMyProfile } from "@/features/profile/hooks/use-my-profile"

export function MyProfileDashboard() {
  const router = useRouter()
  const {
    user,
    profileViews,
    profileLikes,
    loading,
    error,
    isEditing,
    setIsEditing,
    selectedPhotoIndex,
    setSelectedPhotoIndex,
    uploading,
    fileInputRef,
    handleUploadPhoto,
    handleSetMainPhoto,
    handleDeletePhoto,
    activity,
  } = useMyProfile()

  const photos = user?.photos ?? []
  const mainPhoto = photos.find((p) => p.isMain) ?? photos[0]
  const displayPhotos =
    photos.length > 0 ? photos.map((p) => p.url) : [PROFILE_PHOTO_PLACEHOLDER]
  const location =
    [user?.city, user?.country].filter(Boolean).join(", ") || "Location not set"

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
    <AuthenticatedShell>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
          <div className="flex flex-col">
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
                  <Camera className="mr-2 size-4" />
                  {uploading ? "Uploading..." : "Edit Cover"}
                </Button>
              </div>
            </div>

            <div className="relative border-b px-4 pb-6 lg:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:-mt-20 -mt-16">
                <div className="relative">
                  <Avatar className="size-32 border-4 border-background ring-4 ring-background/50 sm:size-40">
                    <AvatarImage
                      src={mainPhoto?.url ?? PROFILE_PHOTO_PLACEHOLDER}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback>
                      <User className="size-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute right-0 bottom-0 size-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold">
                        {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                          user.userName ||
                          "User"}
                      </h1>
                      {calculateAge(user.dateOfBirth) != null && (
                        <Badge variant="outline" className="text-xs">
                          {calculateAge(user.dateOfBirth)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">@{user.userName}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        <span>{location}</span>
                      </div>
                      {user.createdAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          <span>{formatJoinedDate(user.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-2 size-4" />
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>
              </div>

              {user.biography && (
                <div className="mt-4">
                  <p className="text-sm leading-relaxed">{user.biography}</p>
                </div>
              )}

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

            <div className="px-4 lg:px-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:border-b-2"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="photos"
                    className="data-[state=active]:border-b-2"
                  >
                    <ImageIcon className="mr-2 size-4" />
                    Photos
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:border-b-2"
                  >
                    <Activity className="mr-2 size-4" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:border-b-2"
                  >
                    <Settings className="mr-2 size-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <div className="mt-1 flex items-center gap-1 text-xs text-yellow-500">
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
                            <Badge
                              key={i.id}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm"
                            >
                              {(i as { interest?: { name: string } }).interest?.name ??
                                i.interestId}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="photos" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                          {photo.isMain && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-primary/90 text-primary-foreground text-[10px] backdrop-blur-sm">
                                Main
                              </Badge>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                          <div className="absolute inset-x-2 bottom-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!photo.isMain && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 flex-1 text-xs backdrop-blur-sm"
                                onClick={() => handleSetMainPhoto(photo.id)}
                              >
                                <Star className="size-3 mr-1" />
                                Set main
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2.5 text-xs backdrop-blur-sm"
                              onClick={() => handleDeletePhoto(photo.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      >
                        <Camera className="size-6" />
                        <span className="text-xs font-medium">{uploading ? "Uploading..." : "Add Photo"}</span>
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadPhoto}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activity.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">
                          No recent activity yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {activity.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50"
                            >
                              <Avatar className="size-10">
                                <AvatarImage src={item.avatar} alt={item.user} />
                                <AvatarFallback>
                                  <User className="size-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{item.user}</span>
                                  <span className="text-muted-foreground">
                                    {item.action}
                                  </span>
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
                        <Heart className="mr-2 size-4" />
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
    </AuthenticatedShell>
  )
}
