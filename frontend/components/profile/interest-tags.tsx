"use client"

import { Tags } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InterestTagsProps {
  interests: string[]
}

export function InterestTags({ interests }: InterestTagsProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tags className="size-5 text-primary" />
          Interests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {interests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No interests added yet. Add tags in Settings to help others find you.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-3 py-1 text-sm font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
