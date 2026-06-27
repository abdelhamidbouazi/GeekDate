"use client"

import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompatibilityPreview } from "@/types/profile"

interface CompatibilityPreviewCardProps {
  compatibility: CompatibilityPreview | null
  isOwner?: boolean
}

export function CompatibilityPreviewCard({
  compatibility,
  isOwner = false,
}: CompatibilityPreviewCardProps) {
  return (
    <Card className="border-border/60 bg-gradient-to-br from-card via-card to-rose-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="size-5 text-rose-500" />
          {isOwner ? "Match Preview" : "Compatibility"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!compatibility ? (
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Browse profiles to discover your best matches."
              : "Not enough shared interests to calculate compatibility."}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold tabular-nums">
                  {compatibility.score}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {compatibility.label}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all"
                  style={{ width: `${compatibility.score}%` }}
                />
              </div>
            </div>
            {compatibility.sharedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Shared interests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {compatibility.sharedTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
