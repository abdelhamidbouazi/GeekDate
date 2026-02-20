"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const lightModeRoutes = [
  "/home",
  "/login",
  "/signup",
  "/register",
  "/forget-password",
  "/forgot-password",
  "/complete-profile",
]

const THEME_STORAGE_KEY = "geekdate-theme-preference"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    
    // If user has manually set a preference, respect it
    if (savedTheme === "dark" || savedTheme === "light") {
      const html = document.documentElement
      if (savedTheme === "dark") {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }
      return
    }

    // Otherwise, use route-based theme
    const isLightRoute = lightModeRoutes.some((route) => pathname.startsWith(route))
    const html = document.documentElement

    if (isLightRoute) {
      html.classList.remove("dark")
    } else {
      html.classList.add("dark")
    }
  }, [pathname])

  // Set initial theme immediately on mount to prevent flash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      
      if (savedTheme === "dark" || savedTheme === "light") {
        const html = document.documentElement
        if (savedTheme === "dark") {
          html.classList.add("dark")
        } else {
          html.classList.remove("dark")
        }
        return
      }

      const currentPath = window.location.pathname
      const isLightRoute = lightModeRoutes.some((route) => currentPath.startsWith(route))
      const html = document.documentElement

      if (isLightRoute) {
        html.classList.remove("dark")
      } else {
        html.classList.add("dark")
      }
    }
  }, [])

  return <>{children}</>
}
