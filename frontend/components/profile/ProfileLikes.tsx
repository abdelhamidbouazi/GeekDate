import type React from "react"
import { Heart, Link2 } from "lucide-react"

import type { PrivateProfilePerson } from "@/types/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileLikesProps {
  likes: PrivateProfilePerson[]
  matches: PrivateProfilePerson[]
}

function PersonRow({
  person,
  icon,
}: {
  person: PrivateProfilePerson
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 rounded-md">
          <AvatarImage src={person.avatarUrl} alt={person.firstName} />
          <AvatarFallback>{person.firstName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {person.firstName}, {person.age}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{person.username} - {person.city}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {icon}
        <Badge variant="secondary" className="rounded-sm">
          {person.fameRating}
        </Badge>
      </div>
    </div>
  )
}

export function ProfileLikes({ likes, matches }: ProfileLikesProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Likes received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {likes.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No likes received yet.
            </p>
          ) : (
            likes.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                icon={<Heart className="size-4 text-primary" />}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Matches / connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {matches.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No connections yet. Mutual likes will appear here.
            </p>
          ) : (
            matches.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                icon={<Link2 className="size-4 text-primary" />}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
