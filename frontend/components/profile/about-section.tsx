"use client"

import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AboutSectionProps {
  bio: string | null
  isOwner?: boolean
}

export function AboutSection({ bio, isOwner = false }: AboutSectionProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="size-5 text-primary" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bio ? (
          <p className="text-sm leading-relaxed text-foreground/90">{bio}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Tell others about yourself. Add a bio in Settings."
              : "This user hasn't added a bio yet."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
