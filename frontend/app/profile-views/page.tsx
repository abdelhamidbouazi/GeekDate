"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Eye, Heart, MessageCircle, Clock } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProfileView {
  id: number
  name: string
  age: number
  role: string
  avatar: string
  viewedAt: string
  liked: boolean
}

function ProfileViewCard({ view }: { view: ProfileView }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="group relative rounded-2xl overflow-hidden bg-card/50 dark:bg-card/40 border border-border/30 dark:border-border/20 backdrop-blur-sm transition-all duration-300 hover:border-border/60 dark:hover:border-border/40 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={view.avatar}
          alt={`${view.name}, ${view.age}`}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isHovered && "scale-105"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {view.liked && (
          <div className="absolute top-3 right-3 z-10">
            <div className="rounded-full bg-pink-500/90 backdrop-blur-md border-2 border-pink-400/60 p-2 shadow-lg">
              <Heart className="size-4 text-white fill-white" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-white">{view.name}</h3>
              <span className="text-lg text-white/80">{view.age}</span>
            </div>
            <p className="text-sm font-medium text-white/90">{view.role}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>Viewed {view.viewedAt}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 hover:bg-accent transition-colors"
          >
            <MessageCircle className="size-4 mr-2" />
            Message
          </Button>
          <Button 
            size="sm" 
            className={cn(
              "flex-1 transition-all",
              view.liked 
                ? "bg-pink-500 hover:bg-pink-600 text-white" 
                : "bg-primary hover:bg-primary/90"
            )}
          >
            <Heart className={cn(
              "size-4 mr-2",
              view.liked && "fill-current"
            )} />
            {view.liked ? "Liked" : "Like"}
          </Button>
        </div>
      </div>
    </article>
  )
}

const profileViews: ProfileView[] = [
  {
    id: 1,
    name: "Alex",
    age: 28,
    role: "Full‑stack Developer",
    avatar: "/image3.webp",
    viewedAt: "2 hours ago",
    liked: true,
  },
  {
    id: 2,
    name: "Sam",
    age: 25,
    role: "Game Developer",
    avatar: "/image2.jpeg",
    viewedAt: "5 hours ago",
    liked: false,
  },
  {
    id: 3,
    name: "Taylor",
    age: 27,
    role: "Frontend Engineer",
    avatar: "/image4.jpg",
    viewedAt: "1 day ago",
    liked: true,
  },
  {
    id: 4,
    name: "Riley",
    age: 24,
    role: "Data Scientist",
    avatar: "/image5.webp",
    viewedAt: "2 days ago",
    liked: false,
  },
]

export default function ProfileViewsPage() {
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
                  <div className="rounded-full bg-purple-500/10 p-3">
                    <Eye className="size-6 text-purple-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Views</h1>
                    <p className="text-muted-foreground">
                      See who's been checking out your profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {profileViews.map((view) => (
                    <ProfileViewCard key={view.id} view={view} />
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
