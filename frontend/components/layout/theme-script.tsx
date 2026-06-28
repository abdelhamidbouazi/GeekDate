"use client"

import { useEffect } from "react"

export function ThemeScript() {
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("geekdate-theme-preference") : null
    if (saved === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  return null
}
