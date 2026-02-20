"use client"

import { use } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  MapPin,
  Code2,
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
  Activity,
  Star,
  TrendingUp,
  X,
  ArrowLeft,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

// Mock data - in real app, this would come from API based on [id]
const getUserProfile = (id: string) => {
  const profiles: Record<string, any> = {
    "1": {
      id: "1",
      name: "Sarah Martinez",
      username: "@sarahm",
      age: 26,
      role: "Frontend Developer",
      location: "New York, NY",
      bio: "Passionate about React and TypeScript. Love building beautiful UIs and contributing to open source. Coffee addict and bookworm.",
      website: "sarahmartinez.dev",
      joinedDate: "Joined January 2024",
      photos: [
        "/image2.jpeg",
        "/image1.webp",
        "/image3.webp",
        "/image4.jpg",
        "/image5.webp",
      ],
      interests: [
        "React",
        "TypeScript",
        "Design Systems",
        "UI/UX",
        "Open Source",
        "Reading",
        "Photography",
      ],
      stats: {
        profileViews: 892,
        matches: 67,
        likesReceived: 234,
        fameRating: 7.8,
      },
      activity: [
        {
          id: 1,
          type: "like",
          user: "You",
          action: "liked this profile",
          time: "1 hour ago",
        },
        {
          id: 2,
          type: "view",
          user: "You",
          action: "viewed this profile",
          time: "2 hours ago",
        },
      ],
      online: true,
      match: 87,
    },
    "2": {
      id: "2",
      name: "Mike Rodriguez",
      username: "@miker",
      age: 30,
      role: "Backend Engineer",
      location: "Austin, TX",
      bio: "Building scalable APIs and distributed systems. Kubernetes enthusiast. Love hiking and craft beer.",
      website: "mikerodriguez.dev",
      joinedDate: "Joined November 2023",
      photos: [
        "/image3.webp",
        "/image4.jpg",
        "/image5.webp",
        "/image1.webp",
        "/image2.jpeg",
      ],
      interests: [
        "Go",
        "Kubernetes",
        "Microservices",
        "DevOps",
        "Hiking",
        "Craft Beer",
      ],
      stats: {
        profileViews: 1245,
        matches: 89,
        likesReceived: 312,
        fameRating: 8.2,
      },
      activity: [],
      online: false,
      match: 92,
    },
  }
  return profiles[id] || profiles["1"]
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const profileData = getUserProfile(resolvedParams.id)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

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
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
            <div className="flex flex-col">
              {/* Cover Photo Section */}
              <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url('${profileData.photos[0]}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Button variant="outline" size="sm" className="backdrop-blur-sm" asChild>
                    <Link href="/browse">
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Profile Header */}
              <div className="relative px-4 lg:px-6 pb-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="size-32 sm:size-40 border-4 border-background ring-4 ring-background/50">
                      <AvatarImage src={profileData.photos[0]} alt={profileData.name} />
                      <AvatarFallback>
                        <User className="size-12" />
                      </AvatarFallback>
                    </Avatar>
                    {profileData.online && (
                      <div className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-4 border-background" />
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold">{profileData.name}</h1>
                        <Badge variant="outline" className="text-xs">
                          {profileData.age}
                        </Badge>
                        {profileData.online && (
                          <Badge variant="secondary" className="text-xs">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                            Online
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{profileData.username}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-4" />
                          <span>{profileData.role}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-4" />
                          <span>{profileData.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LinkIcon className="size-4" />
                          <a
                            href={`https://${profileData.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary"
                          >
                            {profileData.website}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          <span>{profileData.joinedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      >
                        <Heart className="size-4 mr-2 fill-current" />
                        Like
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="size-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="icon">
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                  <p className="text-sm leading-relaxed">{profileData.bio}</p>
                </div>

                {/* Stats */}
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{profileData.stats.profileViews}</span>{" "}
                      <span className="text-muted-foreground">profile views</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{profileData.stats.matches}</span>{" "}
                      <span className="text-muted-foreground">matches</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-semibold">{profileData.stats.fameRating}</span>{" "}
                      <span className="text-muted-foreground">fame rating</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-muted-foreground fill-current text-pink-500" />
                    <span className="text-sm">
                      <span className="font-semibold">{profileData.match}%</span>{" "}
                      <span className="text-muted-foreground">match with you</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger value="overview" className="data-[state=active]:border-b-2">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="photos" className="data-[state=active]:border-b-2">
                      <ImageIcon className="size-4 mr-2" />
                      Photos
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:border-b-2">
                      <Activity className="size-4 mr-2" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profile Views
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {profileData.stats.profileViews}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                            <TrendingUp className="size-3" />
                            <span>+8% this month</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Matches
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{profileData.stats.matches}</div>
                          <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                            <TrendingUp className="size-3" />
                            <span>+3 this week</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Likes Received
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {profileData.stats.likesReceived}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Heart className="size-3" />
                            <span>Total likes</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Fame Rating
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {profileData.stats.fameRating}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                            <Star className="size-3 fill-current" />
                            <span>Popular</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Interests */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Interests & Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests.map((interest: string) => (
                            <Badge
                              key={interest}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Activity Graph */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last 7 days</span>
                            <span className="font-semibold">Active</span>
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div
                                key={i}
                                className="aspect-square rounded bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs font-semibold"
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="photos" className="mt-6">
                    {/* Photo Gallery */}
                    <div className="space-y-6">
                      <div className="relative aspect-[4/5] max-w-2xl mx-auto rounded-2xl overflow-hidden bg-muted">
                        <Image
                          src={profileData.photos[selectedPhotoIndex]}
                          alt={`Photo ${selectedPhotoIndex + 1}`}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="text-white text-sm font-medium">
                            {selectedPhotoIndex + 1} / {profileData.photos.length}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {profileData.photos.map((photo: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPhotoIndex(index)}
                            className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                              selectedPhotoIndex === index
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={photo}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-6">
                    {/* Activity Feed */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profileData.activity.length > 0 ? (
                          <div className="space-y-4">
                            {profileData.activity.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <Avatar className="size-10">
                                  <AvatarFallback>
                                    <User className="size-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{item.user}</span>
                                    <span className="text-muted-foreground">{item.action}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{item.time}</span>
                                </div>
                                <Badge
                                  variant={
                                    item.type === "match"
                                      ? "default"
                                      : item.type === "like"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {item.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No recent activity
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
