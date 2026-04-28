"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel } from "@/components/ui/carousel"
import { ProfileCard } from "./profile-card"

const profileData = [
  {
    imageSrc: "/image3.webp",
    imageAlt: "Profile - Developer",
    name: "Alex",
    age: 28,
    title: "Full-stack Developer",
    tags: [
      { label: "Python", color: "bg-blue-600" },
      { label: "React", color: "bg-purple-600" },
    ],
    bio: ["Gaming enthusiast", "Open source contributor"],
    overlayColors: {
      top: "bg-blue-600/20",
      bottom: "bg-purple-600/20",
    },
  },
  {
    imageSrc: "/image2.jpeg",
    imageAlt: "Profile - Gamer",
    name: "Sam",
    age: 25,
    title: "Game Developer",
    tags: [
      { label: "JavaScript", color: "bg-green-600" },
      { label: "Gaming", color: "bg-pink-600" },
    ],
    bio: ["Tech blogger", "Indie game creator"],
    overlayColors: {
      top: "bg-green-600/20",
      bottom: "bg-pink-600/20",
    },
  },
  {
    imageSrc: "/image1.webp",
    imageAlt: "Profile - Tech Enthusiast",
    name: "Jordan",
    age: 30,
    title: "Systems Engineer",
    tags: [
      { label: "Rust", color: "bg-orange-600" },
      { label: "DevOps", color: "bg-cyan-600" },
    ],
    bio: ["Open source contributor", "Infrastructure expert"],
    overlayColors: {
      top: "bg-orange-600/20",
      bottom: "bg-cyan-600/20",
    },
  },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
      {/* Creative Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/20 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/10" />
      
      {/* Animated Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-300/15 dark:bg-indigo-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center">
          {/* Left Side - Text and CTAs */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 lg:mb-8">
              Dating for
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Geeks</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 lg:mb-10 max-w-2xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed">
              Connect with developers, gamers, and tech enthusiasts. 
              Find someone who gets your references and shares your passion.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button size="lg" className="w-full sm:w-auto shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-105 transition-all duration-300" asChild>
                <Link href="/signup">Sign Up Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:scale-105 transition-all duration-300" asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Creative Profile Cards Carousel */}
          <div className="w-full flex justify-center lg:justify-end order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] h-[500px] sm:h-[550px] lg:h-[650px] xl:h-[700px]">
              <Carousel className="h-full" showStack={true}>
                {profileData.map((profile, index) => (
                  <ProfileCard key={index} {...profile} />
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
