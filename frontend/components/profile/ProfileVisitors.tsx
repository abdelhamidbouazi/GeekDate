import type { PrivateProfilePerson } from "@/types/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProfileVisitorsProps {
  visitors: PrivateProfilePerson[]
}

export function ProfileVisitors({ visitors }: ProfileVisitorsProps) {
  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-base">Profile visitors</CardTitle>
      </CardHeader>
      <CardContent>
        {visitors.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No one has viewed your profile yet.
          </p>
        ) : (
          <ScrollArea className="h-72 pr-3">
            <div className="space-y-3">
              {visitors.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
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
                  <div className="shrink-0 text-right">
                    <Badge variant="secondary" className="rounded-sm">
                      {person.fameRating}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {person.occurredAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
