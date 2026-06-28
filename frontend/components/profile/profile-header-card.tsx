"use client"

import Link from "next/link"
import { Calendar, Edit, MapPin, Star, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { UserProfile } from "@/types/profile"
import { cn } from "@/lib/utils"

interface ProfileHeaderCardProps {
  profile: UserProfile
  isOwner?: boolean
  className?: string
}

export function ProfileHeaderCard({
  profile,
  isOwner = false,
  className,
}: ProfileHeaderCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-card/80 shadow-lg shadow-rose-950/5 backdrop-blur-sm",
        className
      )}
    >
      <div className="relative h-44 sm:h-52">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-orange-400/20 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:-mt-16 -mt-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative w-fit">
              <Avatar className="size-28 border-4 border-background ring-4 ring-background/60 sm:size-32">
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                <AvatarFallback>
                  <User className="size-10" />
                </AvatarFallback>
              </Avatar>
              {profile.isOnline && (
                <span
                  className="absolute right-2 bottom-2 size-4 rounded-full border-2 border-background bg-emerald-500"
                  aria-label="Online"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {profile.displayName}
                </h1>
                {profile.age != null && (
                  <Badge variant="outline">{profile.age}</Badge>
                )}
                <Badge className="bg-gradient-to-r from-rose-500 to-orange-400 text-white border-0">
                  <Star className="mr-1 size-3 fill-current" />
                  {profile.fameRating}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">@{profile.userName}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  {profile.location}
                </span>
                {profile.joinedLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4 shrink-0" />
                    {profile.joinedLabel}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    profile.isOnline
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      profile.isOnline ? "bg-emerald-500" : "bg-muted-foreground"
                    )}
                  />
                  {profile.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <Button variant="outline" className="shrink-0" asChild>
              <Link href="/profile">
                <Edit className="mr-2 size-4" />
                Edit Profile
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
