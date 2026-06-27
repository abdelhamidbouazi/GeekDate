"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Heart,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { AboutSection } from "@/components/profile/about-section"
import { CompatibilityPreviewCard } from "@/components/profile/compatibility-preview"
import { InterestTags } from "@/components/profile/interest-tags"
import { PhotoGallery } from "@/components/profile/photo-gallery"
import { ProfileHeaderCard } from "@/components/profile/profile-header-card"
import { ProfileStats } from "@/components/profile/profile-stats"
import { RecentActivity } from "@/components/profile/recent-activity"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { CompatibilityPreview, ProfileActivityItem, UserProfile } from "@/types/profile"

export interface ProfilePageContentProps {
  mode: "owner" | "visitor"
  profile: UserProfile | null
  activity?: ProfileActivityItem[]
  compatibility?: CompatibilityPreview | null
  loading?: boolean
  error?: string | null
  uploading?: boolean
  liked?: boolean
  actionLoading?: boolean
  showActions?: boolean
  canLike?: boolean
  canMessage?: boolean
  likeDisabledReason?: string
  onRetry?: () => void
  onUpload?: (file: File) => void
  onSetMain?: (photoId: string) => void
  onDelete?: (photoId: string) => void
  onLike?: () => void
  onUnlike?: () => void
  onMessage?: () => void
  onBlock?: () => void
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}

export function ProfilePageContent({
  mode,
  profile,
  activity = [],
  compatibility = null,
  loading = false,
  error = null,
  uploading = false,
  liked = false,
  actionLoading = false,
  showActions = false,
  canLike = true,
  canMessage = false,
  likeDisabledReason = "Add a profile picture before liking profiles.",
  onRetry,
  onUpload,
  onSetMain,
  onDelete,
  onLike,
  onUnlike,
  onMessage,
  onBlock,
}: ProfilePageContentProps) {
  const isOwner = mode === "owner"

  if (loading && !profile) {
    return (
      <AuthenticatedShell>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ProfileSkeleton />
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedShell>
    )
  }

  if (error && !profile) {
    return (
      <AuthenticatedShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </AuthenticatedShell>
    )
  }

  if (!profile) return null

  return (
    <AuthenticatedShell>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6 px-4 lg:px-6">
              {!isOwner && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/browse">
                      <ArrowLeft className="mr-2 size-4" />
                      Back to Browse
                    </Link>
                  </Button>
                  {showActions && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500"
                        onClick={liked ? onUnlike : onLike}
                        disabled={actionLoading || (!liked && !canLike)}
                        title={!liked && !canLike ? likeDisabledReason : undefined}
                      >
                        {actionLoading ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Heart
                            className={`mr-2 size-4 ${liked ? "fill-current" : ""}`}
                          />
                        )}
                        {liked ? "Liked" : "Like"}
                      </Button>
                      {canMessage && (
                        <Button
                          variant="outline"
                          onClick={onMessage}
                          disabled={actionLoading}
                        >
                          <MessageCircle className="mr-2 size-4" />
                          Message
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={onBlock}
                        disabled={actionLoading}
                        aria-label="Block user"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <ProfileHeaderCard profile={profile} isOwner={isOwner} />

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <AboutSection bio={profile.bio} isOwner={isOwner} />
                  <InterestTags interests={profile.interests} />
                  <PhotoGallery
                    photos={profile.photos}
                    isOwner={isOwner}
                    uploading={uploading}
                    onUpload={isOwner ? onUpload : undefined}
                    onSetMain={isOwner ? onSetMain : undefined}
                    onDelete={isOwner ? onDelete : undefined}
                  />
                  {isOwner && <RecentActivity activity={activity} />}
                </div>

                <div className="space-y-6">
                  <ProfileStats stats={profile.stats} />
                  <CompatibilityPreviewCard
                    compatibility={compatibility}
                    isOwner={isOwner}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
