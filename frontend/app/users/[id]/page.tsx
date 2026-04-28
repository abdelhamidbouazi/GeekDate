"use client"

import { use, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  MapPin,
  Heart,
  MessageCircle,
  Calendar,
  Image as ImageIcon,
  Star,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { profileApi, getUserIdFromToken, type AppUser } from "@/lib/services/profile-api"
import { browseApi } from "@/lib/services/browse-api"
import { chatApi } from "@/lib/services/chat-api"
import {
  calculateAge,
  formatJoinedDate,
  PROFILE_PHOTO_PLACEHOLDER,
} from "@/lib/utils/profile"

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const currentUserId = getUserIdFromToken()

  const id = resolvedParams.id

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await profileApi.getUser(id)
        if (!cancelled) setProfile(data)
        if (!cancelled && currentUserId && currentUserId !== id) {
          profileApi.markProfileViewed(id).catch(() => {})
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, currentUserId])

  const handleLike = useCallback(async () => {
    if (!id || actionLoading) return
    setActionLoading(true)
    try {
      await browseApi.likeProfile(id)
      setLiked(true)
    } catch {
      // ignore
    } finally {
      setActionLoading(false)
    }
  }, [id, actionLoading])

  const handleUnlike = useCallback(async () => {
    if (!id || actionLoading) return
    setActionLoading(true)
    try {
      await browseApi.unlikeProfile(id)
      setLiked(false)
    } catch {
      // ignore
    } finally {
      setActionLoading(false)
    }
  }, [id, actionLoading])

  const handleMessage = useCallback(async () => {
    if (!id || actionLoading) return
    setActionLoading(true)
    try {
      await chatApi.createConversation(id)
      router.push("/messages")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start conversation. You may need to match first.")
    } finally {
      setActionLoading(false)
    }
  }, [id, actionLoading, router])

  const handleBlock = useCallback(async () => {
    if (!id || actionLoading) return
    if (!confirm("Block this user? You won't see each other.")) return
    setActionLoading(true)
    try {
      await profileApi.blockProfile(id)
      router.push("/browse")
    } catch {
      // ignore
    } finally {
      setActionLoading(false)
    }
  }, [id, actionLoading, router])

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/browse")}>
          Back to Browse
        </Button>
      </div>
    )
  }

  if (!profile) return null

  const photos = profile.photos ?? []
  const mainPhoto = photos.find((p) => p.isMain) ?? photos[0]
  const photoUrls =
    photos.length > 0 ? photos.map((p) => p.url) : [PROFILE_PHOTO_PLACEHOLDER]
  const location = [profile.city, profile.country].filter(Boolean).join(", ") || "Location not set"
  const age = calculateAge(profile.dateOfBirth)
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.userName
  const interests = profile.interests ?? []
  const interestNames = interests.map((i) => i.interest?.name ?? i.interestId).filter(Boolean)

  return (
    <AuthenticatedShell>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
            <div className="flex flex-col">
              {/* Cover Photo */}
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
                <div className="absolute top-4 left-4">
                  <Button variant="outline" size="sm" className="backdrop-blur-sm" asChild>
                    <Link href="/browse">
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Profile Header */}
              <div className="relative px-4 lg:px-6 pb-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
                  <Avatar className="size-32 sm:size-40 border-4 border-background ring-4 ring-background/50">
                    <AvatarImage
                      src={
                        mainPhoto?.url ??
                        profile.photoProfileUrl ??
                        PROFILE_PHOTO_PLACEHOLDER
                      }
                      alt={displayName}
                    />
                    <AvatarFallback>
                      <User className="size-12" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold">{displayName}</h1>
                        {age != null && (
                          <Badge variant="outline" className="text-xs">
                            {age}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">@{profile.userName}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-4" />
                          <span>{location}</span>
                        </div>
                        {profile.createdAt && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span>{formatJoinedDate(profile.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        onClick={liked ? handleUnlike : handleLike}
                        disabled={actionLoading || currentUserId === id}
                      >
                        <Heart
                          className={`size-4 mr-2 ${liked ? "fill-current" : ""}`}
                        />
                        {actionLoading ? "..." : liked ? "Liked" : "Like"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleMessage}
                        disabled={actionLoading || currentUserId === id}
                      >
                        <MessageCircle className="size-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleBlock}
                        disabled={actionLoading || currentUserId === id}
                        aria-label="Block"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {profile.biography && (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed">{profile.biography}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{profile.fameRating ?? 0}</span>{" "}
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
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Fame Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {profile.fameRating ?? 0}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                          <Star className="size-3 fill-current" />
                          <span>Popular</span>
                        </div>
                      </CardContent>
                    </Card>

                    {interestNames.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Interests & Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {interestNames.map((name) => (
                              <Badge
                                key={name}
                                variant="secondary"
                                className="px-3 py-1.5 text-sm"
                              >
                                {name}
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
                          src={
                            photoUrls[selectedPhotoIndex] ??
                            PROFILE_PHOTO_PLACEHOLDER
                          }
                          alt={`Photo ${selectedPhotoIndex + 1}`}
                          fill
                          className="object-cover"
                          priority
                          unoptimized={photoUrls[selectedPhotoIndex]?.startsWith("data:")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                          <span className="text-white text-sm font-medium">
                            {photoUrls.length > 0
                              ? `${selectedPhotoIndex + 1} / ${photoUrls.length}`
                              : "No photos"}
                          </span>
                        </div>
                      </div>

                      {photoUrls.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                          {photoUrls.map((url, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedPhotoIndex(index)}
                              className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                                selectedPhotoIndex === index
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <Image
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={url.startsWith("data:")}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
    </AuthenticatedShell>
  )
}
