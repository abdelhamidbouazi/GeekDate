"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

const THEME_STORAGE_KEY = "geekdate-theme-preference"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const html = document.documentElement
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    const currentIsDark = html.classList.contains("dark")

    if (savedTheme === "dark" || savedTheme === "light") {
      // Apply saved preference
      if (savedTheme === "dark") {
        html.classList.add("dark")
        setIsDark(true)
      } else {
        html.classList.remove("dark")
        setIsDark(false)
      }
    } else {
      // Use current state
      setIsDark(currentIsDark)
    }
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const newIsDark = !html.classList.contains("dark")

    if (newIsDark) {
      html.classList.add("dark")
      localStorage.setItem(THEME_STORAGE_KEY, "dark")
    } else {
      html.classList.remove("dark")
      localStorage.setItem(THEME_STORAGE_KEY, "light")
    }

    setIsDark(newIsDark)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-8" disabled>
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
