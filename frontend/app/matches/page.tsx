"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { UserCard } from "@/components/user-card"
import { Heart } from "lucide-react"

const matchedProfiles = [
  {
    id: 1,
    name: "Alex",
    age: 28,
    role: "Full‑stack Developer",
    location: "Remote • EU",
    image: "/image3.webp",
    tags: ["TypeScript", "React", "Next.js"],
    bio: "Open‑source contributor, coffee enthusiast, late‑night deploys. Building the future, one commit at a time.",
    match: 95,
    online: true,
    fameRating: 87,
  },
  {
    id: 2,
    name: "Sam",
    age: 25,
    role: "Game Developer",
    location: "Berlin",
    image: "/image2.jpeg",
    tags: ["Unity", "C#", "RPGs"],
    bio: "Boss fights, pixel art, and co‑op sessions. Creating worlds where code meets creativity.",
    match: 92,
    online: true,
    fameRating: 72,
  },
  {
    id: 3,
    name: "Taylor",
    age: 27,
    role: "Frontend Engineer",
    location: "London",
    image: "/image4.jpg",
    tags: ["Design Systems", "Tailwind", "UX"],
    bio: "Dark mode, clean UI, messy git branches. Crafting interfaces that feel like home.",
    match: 90,
    online: true,
    fameRating: 68,
  },
]

export default function MatchesPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-pink-500/10 p-3">
                    <Heart className="size-6 text-pink-500 fill-pink-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Matches</h1>
                    <p className="text-muted-foreground">
                      People who liked you back. Start a conversation!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {matchedProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="opacity-0 animate-fade-in"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <UserCard
                        id={profile.id}
                        name={profile.name}
                        age={profile.age}
                        role={profile.role}
                        location={profile.location}
                        image={profile.image}
                        tags={profile.tags}
                        bio={profile.bio}
                        match={profile.match}
                        online={profile.online}
                        fameRating={profile.fameRating}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
