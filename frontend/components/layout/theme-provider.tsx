"use client"

import { useEffect } from "react"

const THEME_STORAGE_KEY = "geekdate-theme-preference"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  return <>{children}</>
}
