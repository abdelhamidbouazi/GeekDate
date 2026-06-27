"use client"

import Image from "next/image"
import { MapPin } from "lucide-react"
import {
  profileSummaryDisplayName,
  profileSummaryLocation,
  resolveProfileMediaUrl,
  type ProfileSummaryUser,
} from "@/lib/services/profile-api"
import { cn } from "@/lib/utils"

export type ProfileSummaryCardProps = {
  profile: ProfileSummaryUser
  index?: number
  badge?: React.ReactNode
  subtitle?: string
  busy?: boolean
  actions?: React.ReactNode
  accent?: "rose" | "amber"
}

export function ProfileSummaryCard({
  profile,
  index = 0,
  badge,
  subtitle,
  busy = false,
  actions,
  accent = "rose",
}: ProfileSummaryCardProps) {
  const name = profileSummaryDisplayName(profile)
  const imageSrc = resolveProfileMediaUrl(profile.profilePicture)
  const age =
    profile.age != null && profile.age > 0 ? profile.age : null
  const location = profileSummaryLocation(profile)
  const id = profile.id

  const accentBorder =
    accent === "amber"
      ? "border-amber-500/15"
      : "border-rose-500/15"

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm",
        accentBorder,
        "opacity-0 animate-fade-in"
      )}
      style={{
        animationDelay: `${Math.min(index, 12) * 55}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex flex-1 flex-col sm:flex-row">
        <div className="relative aspect-[4/5] w-full shrink-0 sm:aspect-auto sm:w-[42%] sm:min-h-[200px]">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 280px"
            unoptimized={
              imageSrc.startsWith("data:") || imageSrc.includes("localhost")
            }
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-transparent sm:to-transparent"
            aria-hidden
          />
          {badge ? (
            <div className="absolute left-3 top-3">{badge}</div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {name}
              </h2>
              {age != null && (
                <span className="text-muted-foreground tabular-nums">{age}</span>
              )}
            </div>
            {location ? (
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {location}
              </p>
            ) : null}
            {subtitle ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>

          {id && actions ? (
            <div
              className="flex flex-col gap-2 sm:flex-row"
              data-busy={busy || undefined}
            >
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
