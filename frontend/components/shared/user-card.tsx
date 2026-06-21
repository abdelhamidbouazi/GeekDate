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
      className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card/70 shadow-xl shadow-rose-950/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-rose-500/15 dark:bg-card/50 dark:shadow-black/40 sm:rounded-3xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      <div className="relative aspect-3/4 overflow-hidden">
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
          unoptimized
        />

        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/62 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-rose-950/45 via-rose-950/10 to-transparent" />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-start justify-between z-10">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {online && (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-2 py-1 backdrop-blur-xl sm:gap-2 sm:px-3 sm:py-1.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 sm:h-2 sm:w-2" />
                <span className="text-[10px] sm:text-xs font-semibold text-white dark:text-white/90">Online</span>
              </div>
            )}
            <div className="rounded-full border border-white/20 bg-white/12 px-2 py-1 backdrop-blur-xl sm:px-3 sm:py-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-white dark:text-white/90">{match}% match</span>
            </div>
          </div>
          <div className="rounded-full border border-rose-200/25 bg-rose-500/18 px-2 py-1 backdrop-blur-xl sm:px-3 sm:py-1.5">
            <div className="flex items-center gap-1">
              <Heart className="size-2.5 fill-rose-200 text-rose-200 sm:size-3" />
              <span className="text-[10px] sm:text-xs font-semibold text-white dark:text-white/90">{fameRating}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
          <div className="space-y-1.5 sm:space-y-2">
            <div>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mb-0.5">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-white dark:text-white">{name}</h3>
                <span className="text-sm sm:text-base md:text-lg text-white/80 dark:text-white/70">{age}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90 dark:text-white/80 mb-0.5">
                <Code2 className="size-3 shrink-0" />
                <span className="text-xs font-medium">{role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 dark:text-white/70 mb-1">
                <MapPin className="size-3 shrink-0" />
                <span className="text-[11px] leading-tight">{location}</span>
              </div>
            </div>

            <p className="text-white/90 dark:text-white/80 text-xs leading-relaxed line-clamp-2">{bio}</p>

            <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md sm:px-2.5 sm:py-1 sm:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20 translate-x-0",
            "transition-opacity duration-200",
            "opacity-100",
            "md:opacity-0 md:pointer-events-none",
            "md:group-hover:opacity-100 md:group-hover:pointer-events-auto",
            "md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto"
          )}
        >
          <Button
            size="icon"
            className="pointer-events-auto h-10 w-10 rounded-full bg-linear-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/35 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
            aria-label="Like"
            onClick={onLike}
          >
            <Heart className="size-5 sm:size-6 fill-current" />
          </Button>
          <Button
            size="icon"
            className="pointer-events-auto h-10 w-10 rounded-full border-2 border-white/30 bg-white/18 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 hover:bg-white/28 active:scale-95 sm:h-12 sm:w-12"
            aria-label="Dislike"
            onClick={onDislike}
          >
            <X className="size-5 sm:size-6 fill-current" />
          </Button>
          {canLinkToProfile ? (
            <Button
              size="icon"
              className="pointer-events-auto h-10 w-10 rounded-full border-2 border-white/30 bg-white/18 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 hover:bg-white/28 active:scale-95 sm:h-12 sm:w-12"
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
              className="pointer-events-auto h-10 w-10 rounded-full border-2 border-white/30 bg-white/18 text-white shadow-lg backdrop-blur-md transition-transform hover:bg-white/28 active:scale-95 sm:h-12 sm:w-12"
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
