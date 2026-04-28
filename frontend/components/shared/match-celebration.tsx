"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type MatchCelebrationProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  image: string
}

export function MatchCelebration({ open, onOpenChange, name, image }: MatchCelebrationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden border-0 bg-gradient-to-b from-pink-500/20 via-background to-background p-0 gap-0">
        <div className="relative px-6 pt-10 pb-4 text-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Heart className="size-[280px] text-pink-500/15 animate-pulse" strokeWidth={1} />
          </div>
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative flex size-28 items-center justify-center">
              <span className="absolute inline-flex size-24 animate-ping rounded-full bg-pink-500/40" />
              <div className="relative size-24 overflow-hidden rounded-full border-4 border-pink-500 shadow-xl ring-4 ring-pink-500/30">
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={image.startsWith("data:")}
                />
              </div>
            </div>
            <DialogHeader className="gap-1 space-y-0">
              <DialogTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                It&apos;s a Match!
              </DialogTitle>
              <DialogDescription className="text-base text-foreground">
                You and <span className="font-semibold text-foreground">{name}</span> liked each other.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 border-t bg-muted/30 p-6 sm:flex-col">
          <Button className="w-full" asChild>
            <Link href="/messages" onClick={() => onOpenChange(false)}>
              Send a message
            </Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Keep swiping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
