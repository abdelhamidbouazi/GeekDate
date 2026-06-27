"use client"

import { Camera, MoreHorizontal, Star, Trash2 } from "lucide-react"

import type { MatchaPhoto } from "@/types/profile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ProfileGalleryProps {
  photos: MatchaPhoto[]
  editable?: boolean
  compact?: boolean
  onSetMain?: (photoId: string) => void
  onDelete?: (photoId: string) => void
}

export function ProfileGallery({
  photos,
  editable = false,
  compact = false,
  onSetMain,
  onDelete,
}: ProfileGalleryProps) {
  const visiblePhotos = photos.slice(0, 5)

  if (visiblePhotos.length === 0) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-md border border-dashed bg-muted/30 p-6 text-center">
        <div className="max-w-sm space-y-2">
          <Camera className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No public photos yet</p>
          <p className="text-xs text-muted-foreground">
            Matcha profiles require at least one profile picture before likes are available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-2 md:grid-cols-5"
          : "grid-cols-2 md:grid-cols-[1.3fr_repeat(2,1fr)]"
      )}
    >
      {visiblePhotos.map((photo, index) => (
        <div
          key={photo.id}
          className={cn(
            "group relative overflow-hidden rounded-md border bg-muted",
            compact ? "aspect-square" : index === 0 ? "aspect-[4/5] md:row-span-2" : "aspect-square"
          )}
        >
          <img
            src={photo.url}
            alt={photo.alt}
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {photo.isMain ? (
            <Badge className="absolute left-3 top-3 gap-1 rounded-sm bg-background/90 text-foreground hover:bg-background/90">
              <Star className="size-3 fill-current" />
              Main
            </Badge>
          ) : null}
          {editable ? (
            <div className="absolute right-2 top-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    className="bg-background/85 backdrop-blur"
                    aria-label="Photo actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={photo.isMain}
                    onClick={() => onSetMain?.(photo.id)}
                  >
                    <Star className="size-4" />
                    Set as profile picture
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={photo.isMain}
                    onClick={() => onDelete?.(photo.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Remove photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
      ))}
      {editable && visiblePhotos.length < 5 ? (
        <button
          type="button"
          className="flex aspect-square items-center justify-center rounded-md border border-dashed bg-muted/25 text-sm text-muted-foreground transition hover:bg-muted/50"
        >
          <span className="flex flex-col items-center gap-2">
            <Camera className="size-5" />
            Add photo
          </span>
        </button>
      ) : null}
    </div>
  )
}
