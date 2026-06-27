"use client"

import { Activity, Heart, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileActivityItem } from "@/types/profile"

interface RecentActivityProps {
  activity: ProfileActivityItem[]
}

const typeIcons = {
  like: Heart,
  view: Eye,
  match: Activity,
}

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="size-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent activity yet. When someone views or likes your profile, it
            will show up here.
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((item) => {
              const Icon = typeIcons[item.type]
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={item.avatar} alt={item.user} />
                    <AvatarFallback className="text-xs">
                      {item.user.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium">{item.user}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    {item.time && (
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    )}
                  </div>
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
