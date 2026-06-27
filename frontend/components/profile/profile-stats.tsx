"use client"

import { Eye, Heart, Sparkles, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileStats } from "@/types/profile"
import { cn } from "@/lib/utils"

interface ProfileStatsProps {
  stats: ProfileStats
  className?: string
}

const statItems = [
  { key: "visits" as const, label: "Visits", icon: Eye },
  { key: "likes" as const, label: "Likes", icon: Heart },
  { key: "matches" as const, label: "Matches", icon: Sparkles },
  { key: "fameRating" as const, label: "Fame", icon: Star },
]

export function ProfileStats({ stats, className }: ProfileStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {statItems.map(({ key, label, icon: Icon }) => (
        <Card
          key={key}
          className="border-border/60 bg-card/80 shadow-sm transition-colors hover:border-primary/20"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{stats[key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
