"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Code2, X, User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UserCardProps {
  id: string | number
  name: string
  age: number
  role: string
  location: string
  image: string
  tags: string[]
  bio: string
  match: number
  online: boolean
  fameRating: number
  onLike?: () => void
  onDislike?: () => void
  /** When false, View Profile button won't link (e.g. when id is not a valid user GUID) */
  profileLink?: boolean
}

export function UserCard({
  id,
  name,
  age,
  role,
  location,
  image,
  tags,
  bio,
  match,
  online,
  fameRating,
  onLike,
  onDislike,
  profileLink = true,
}: UserCardProps) {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))
  const canLinkToProfile = profileLink && isGuid
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-card/50 dark:bg-card/40 border border-border/30 dark:border-border/20 backdrop-blur-sm transition-all duration-500 hover:border-border/60 dark:hover:border-border/40 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-black/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={`${name}, ${age} - ${role}`}
          fill
          className={cn(
            "object-cover transition-transform duration-700",
            isHovered && "scale-110"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          unoptimized={image.startsWith("data:")}
        />

        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 dark:from-black/90 via-black/70 dark:via-black/60 to-black/40 dark:to-black/30" />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-start justify-between z-10">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {online && (
              <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10 flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 dark:bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs font-semibold text-white dark:text-white/90">Online</span>
              </div>
            )}
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10">
              <span className="text-[10px] sm:text-xs font-bold text-white dark:text-white/90">{match}% match</span>
            </div>
          </div>
          <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-1">
              <Heart className="size-2.5 sm:size-3 text-red-400 dark:text-red-500 fill-red-400 dark:fill-red-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white dark:text-white/90">{fameRating}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white dark:text-white">{name}</h3>
                <span className="text-base sm:text-lg md:text-xl text-white/80 dark:text-white/70">{age}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 dark:text-white/80 mb-0.5 sm:mb-1">
                <Code2 className="size-3 sm:size-3.5" />
                <span className="text-xs sm:text-sm font-medium">{role}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-white/80 dark:text-white/70 mb-1 sm:mb-2">
                <MapPin className="size-3 sm:size-3.5" />
                <span className="text-[10px] sm:text-xs">{location}</span>
              </div>
            </div>

            <p className="text-white/90 dark:text-white/80 text-xs sm:text-sm leading-relaxed line-clamp-2">{bio}</p>

            <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-[10px] sm:text-xs font-medium text-white dark:text-white/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 transition-all duration-500 z-20",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
        >
          <Button
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg backdrop-blur-md transition-transform active:scale-95"
            aria-label="Like"
            onClick={onLike}
          >
            <Heart className="size-5 sm:size-6 fill-current" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500/90 hover:bg-red-500 text-white shadow-lg backdrop-blur-md border-2 border-red-400/60 transition-transform active:scale-95"
            aria-label="Dislike"
            onClick={onDislike}
          >
            <X className="size-5 sm:size-6 fill-current" />
          </Button>
          {canLinkToProfile ? (
            <Button
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30 transition-transform active:scale-95"
              aria-label="View Profile"
              asChild
            >
              <Link href={`/users/${id}`}>
                <User className="size-5 sm:size-6 fill-current" />
              </Link>
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md border-2 border-white/30 transition-transform active:scale-95"
              aria-label="View Profile"
              disabled
            >
              <User className="size-5 sm:size-6 fill-current" />
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
