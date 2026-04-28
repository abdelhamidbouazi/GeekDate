"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ThemeScript() {
  const pathname = usePathname()

  useEffect(() => {
    const lightModeRoutes = ['/home', '/login', '/signup', '/register', '/forget-password', '/forgot-password', '/complete-profile']
    const isLightRoute = lightModeRoutes.some(route => pathname?.startsWith(route))
    
    if (isLightRoute) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [pathname])

  return null
}
