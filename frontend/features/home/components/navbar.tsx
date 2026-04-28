"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#trust", label: "Trust & Privacy" },
  ]

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-500",
          scrolled
            ? "bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-border/60 shadow-2xl"
            : "bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-border/50 shadow-xl"
        )}
      >
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/home"
              className="flex items-center gap-3"
              onClick={handleLinkClick}
            >
              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-background/50 p-1.5 border border-border/30">
                <Image
                  src="/geeksdatingnobg.png"
                  alt="GeekDate Logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">GeekDate</span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
                  DATING FOR GEEKS
                </span>
              </div>
            </Link>

            {/* Navigation Pills */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2.5 rounded-full bg-background/30 dark:bg-background/20 border border-border/40 text-sm font-medium text-foreground/80 transition-all duration-300 hover:bg-background/50 hover:border-border/60 hover:text-foreground hover:scale-105 hover:shadow-md"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-all duration-300 hover:bg-background/50 hover:scale-105"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-foreground text-background transition-all duration-300 hover:scale-105 hover:shadow-lg"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div
            className={cn(
              "lg:hidden overflow-hidden transition-all duration-500",
              isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-2 pt-4 border-t border-border/40">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-foreground/80 bg-background/20 border border-border/30 transition-all duration-300 hover:bg-background/40 hover:border-border/50 hover:text-foreground"
                  onClick={handleLinkClick}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-border/40">
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  size="sm"
                  asChild
                  onClick={handleLinkClick}
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  className="w-full rounded-full bg-foreground text-background"
                  size="sm"
                  asChild
                  onClick={handleLinkClick}
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
