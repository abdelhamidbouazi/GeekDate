"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  autoPlay?: boolean
  interval?: number
  showStack?: boolean
}

export function Carousel({ 
  className, 
  children, 
  autoPlay = false,
  interval = 5000,
  showStack = true,
  ...props 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
  }, [totalItems])

  React.useEffect(() => {
    if (!autoPlay || totalItems <= 1) return

    const timer = setInterval(goToNext, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, goToNext, totalItems])

  if (showStack && totalItems > 1) {
    return (
      <div className={cn("relative w-full h-full flex items-center justify-center", className)} {...props}>
        <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
          {childrenArray.map((child, index) => {
            const isActive = index === currentIndex
            const isNext = index === (currentIndex + 1) % totalItems
            const isPrev = index === (currentIndex - 1 + totalItems) % totalItems
            const offset = index - currentIndex
            const absOffset = Math.abs(offset)
            
            let transform = ""
            let zIndex = totalItems - absOffset
            let opacity = 1
            let scale = 1
            
            if (isActive) {
              transform = "translateX(0) translateZ(0) rotateY(0deg)"
              zIndex = totalItems + 1
              scale = 1
              opacity = 1
            } else if (isNext) {
              transform = "translateX(40%) translateZ(-100px) rotateY(-15deg) scale(0.9)"
              opacity = 0.7
            } else if (isPrev) {
              transform = "translateX(-40%) translateZ(-100px) rotateY(15deg) scale(0.9)"
              opacity = 0.7
            } else {
              transform = "translateX(0) translateZ(-200px) rotateY(0deg) scale(0.8)"
              opacity = 0.3
            }

            return (
              <div
                key={index}
                className="absolute top-0 left-0 right-0 bottom-0 transition-all duration-700 ease-out"
                style={{
                  transform,
                  zIndex,
                  opacity,
                  transformStyle: "preserve-3d",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
                  {child}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  // Fallback for single item or non-stack mode
  if (totalItems === 1) {
    return (
      <div className={cn("relative w-full h-full", className)} {...props}>
        {childrenArray[0]}
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)} {...props}>
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="min-w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
