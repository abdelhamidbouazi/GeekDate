"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, X, MessageCircle, User, MapPin, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile } from "./browse-helpers"

export function TikTokCard({
  profile,
  isActive,
  onLike,
  onDislike,
}: {
  profile: Profile
  isActive: boolean
  onLike: (id: string) => void
  onDislike: (id: string) => void
}) {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(true)
    onLike(profile.id)
  }

  const handleDislike = () => {
    onDislike(profile.id)
  }

  return (
    <div
      className={cn(
        "relative h-full w-full flex-shrink-0 snap-start snap-always",
        isActive && "z-10"
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={profile.image}
          alt={`${profile.name}, ${profile.age}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority={isActive}
          unoptimized={profile.image.startsWith("data:")}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex flex-col gap-2">
            {profile.online && (
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-white">Online</span>
              </div>
            )}
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
              <span className="text-xs font-bold text-white">{profile.match}% match</span>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <div className="flex items-center gap-1">
              <Heart className="size-3 text-red-400 fill-red-400" />
              <span className="text-xs font-semibold text-white">{profile.fameRating}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-20">
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-3xl font-bold text-white">{profile.name}</h3>
                <span className="text-xl text-white/80">{profile.age}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 mb-1">
                <Code2 className="size-3.5" />
                <span className="text-sm font-medium">{profile.role}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="size-3.5" />
                <span className="text-xs">{profile.location}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-20 flex flex-col gap-3 z-20">
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg backdrop-blur-md transition-all",
              isLiked
                ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                : "bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
            )}
            onClick={handleLike}
            aria-label="Like"
          >
            <Heart className={cn("size-6", isLiked && "fill-current")} />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30"
            aria-label="Dislike"
            onClick={handleDislike}
          >
            <X className="size-6" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30"
            aria-label="Message"
            asChild
          >
            <Link href={`/messages`}>
              <MessageCircle className="size-6" />
            </Link>
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30"
            aria-label="View Profile"
            asChild
          >
            <Link href={`/users/${profile.id}`}>
              <User className="size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
