"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Ban,
  Flag,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  ShieldCheck,
  Signal,
  Star,
  UserRound,
} from "lucide-react"

import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicProfilePage } from "@/features/profile/hooks/use-public-profile-page"

interface PublicUserProfileProps {
  profileId: string
}

function genderLabel(value: number): string {
  if (value === 1) return "Man"
  if (value === 2) return "Woman"
  return "Not specified"
}

function preferenceLabel(value: number): string | null {
  if (value === 1) return "Interested in men"
  if (value === 2) return "Interested in women"
  if (value === 3) return "Interested in everyone"
  return null
}

function PublicProfileSkeleton() {
  return (
    <AuthenticatedShell>
      <div className="space-y-5 p-4 lg:p-6">
        <Skeleton className="h-[520px] rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </AuthenticatedShell>
  )
}

export function PublicUserProfile({ profileId }: PublicUserProfileProps) {
  const {
    profile,
    loading,
    error,
    liked,
    likedByThem,
    actionLoading,
    showActions,
    isMatched,
    currentUserHasProfilePicture,
    onRetry,
    onLike,
    onUnlike,
    onMessage,
    onBlock,
  } = usePublicProfilePage(profileId)

  if (loading && !profile) return <PublicProfileSkeleton />

  if (error && !profile) {
    return (
      <AuthenticatedShell>
        <div className="grid min-h-[60vh] place-items-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle>Profile unavailable</AlertTitle>
            <AlertDescription className="mt-2">{error}</AlertDescription>
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              Try again
            </Button>
          </Alert>
        </div>
      </AuthenticatedShell>
    )
  }

  if (!profile) {
    return (
      <AuthenticatedShell>
        <div className="grid min-h-[60vh] place-items-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Profile not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>This member is unavailable, blocked, or has not completed a public profile.</p>
              <Button asChild variant="outline">
                <Link href="/browse">Back to Browse</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedShell>
    )
  }

  const photos = profile.photos.slice(0, 5)
  const mainPhoto = photos.find((photo) => photo.isMain) ?? photos[0]
  const publicName = profile.displayName.split(" ").filter(Boolean)[0] || profile.userName
  const preference = preferenceLabel(profile.sexualPreference)

  return (
    <AuthenticatedShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
          <section className="relative min-h-[520px] overflow-hidden rounded-lg border bg-muted">
            {mainPhoto ? (
              <Image
                src={mainPhoto.url}
                alt={publicName}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
                No public photo
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-5 p-5 text-white md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-end gap-4">
                  <Avatar className="size-24 rounded-lg border border-white/30 ring-4 ring-black/20 md:size-32">
                    <AvatarImage src={mainPhoto?.url} alt={publicName} />
                    <AvatarFallback className="rounded-lg bg-white/15 text-white">
                      <UserRound className="size-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                        {publicName}
                      </h1>
                      {profile.age != null && (
                        <Badge className="border-white/20 bg-white/15 text-white">
                          {profile.age}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {profile.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Signal className="size-4" />
                        {profile.isOnline ? "Online now" : "Last connection not public"}
                      </span>
                      <Badge className="border-amber-200/30 bg-amber-300/20 text-amber-50">
                        <Star className="mr-1 size-3 fill-current" />
                        Fame {profile.fameRating}
                      </Badge>
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex flex-wrap gap-2 rounded-lg border border-white/15 bg-black/20 p-2 backdrop-blur-md">
                    <Button
                      onClick={liked ? onUnlike : onLike}
                      disabled={actionLoading || (!liked && !currentUserHasProfilePicture)}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Heart className={`mr-2 size-4 ${liked ? "fill-current" : ""}`} />
                      )}
                      {liked ? "Unlike" : "Like"}
                    </Button>
                    {isMatched && (
                      <Button variant="secondary" onClick={onMessage} disabled={actionLoading}>
                        <MessageCircle className="mr-2 size-4" />
                        Message
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" disabled={actionLoading}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled title="Report fake account is not available in the backend yet.">
                          <Flag className="mr-2 size-4" />
                          Report fake account
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={onBlock}>
                          <Ban className="mr-2 size-4" />
                          Block user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {!currentUserHasProfilePicture && showActions && !liked ? (
                <Alert className="max-w-xl border-white/20 bg-white/10 text-white">
                  <Heart className="size-4" />
                  <AlertTitle>Profile picture required</AlertTitle>
                  <AlertDescription className="text-white/75">
                    Matcha requires your own profile picture before you can like someone.
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Public photos</CardTitle>
                </CardHeader>
                <CardContent>
                  {photos.length === 0 ? (
                    <div className="grid min-h-36 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      No public photos yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {photos.map((photo, index) => (
                        <div key={photo.id} className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
                          <Image
                            src={photo.url}
                            alt={`${publicName} photo ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 180px"
                          />
                          {photo.isMain && (
                            <Badge className="absolute left-2 top-2 bg-black/55 text-white">
                              Main
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Bio and interests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {profile.bio || "This member has not added a biography yet."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{genderLabel(profile.gender)}</Badge>
                    {preference && <Badge variant="outline">{preference}</Badge>}
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="rounded-md">
                        {interest}
                      </Badge>
                    ))}
                    {profile.interests.length === 0 && (
                      <span className="text-sm text-muted-foreground">No public interests yet.</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4" />
                  Connection status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <StatusLine active={liked} label="You liked this user" />
                <StatusLine active={likedByThem} label="This user likes you" />
                <StatusLine active={isMatched} label="You are matched" />
                <p className="pt-2 text-xs leading-5 text-muted-foreground">
                  Public profiles never expose email, exact GPS, last name, visitors, received likes, or account settings.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </AuthenticatedShell>
  )
}

function StatusLine({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={active ? "default" : "secondary"}>{active ? "Yes" : "No"}</Badge>
    </div>
  )
}
