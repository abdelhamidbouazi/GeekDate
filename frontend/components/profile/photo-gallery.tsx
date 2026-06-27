"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Camera, ImageIcon, MoreVertical, Star, Trash2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProfilePhoto } from "@/types/profile"
import { PROFILE_PHOTO_PLACEHOLDER } from "@/lib/utils/profile"

interface PhotoGalleryProps {
  photos: ProfilePhoto[]
  isOwner?: boolean
  uploading?: boolean
  onUpload?: (file: File) => void
  onSetMain?: (photoId: string) => void
  onDelete?: (photoId: string) => void
}

export function PhotoGallery({
  photos,
  isOwner = false,
  uploading = false,
  onUpload,
  onSetMain,
  onDelete,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayPhotos = photos.length > 0 ? photos : []
  const selectedPhoto = displayPhotos[selectedIndex]
  const selectedUrl = selectedPhoto?.url ?? PROFILE_PHOTO_PLACEHOLDER

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUpload) onUpload(file)
    e.target.value = ""
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="size-5 text-primary" />
          Photos
        </CardTitle>
        {isOwner && onUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Add Photo
                </>
              )}
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {displayPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
            <Camera className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? "No photos yet. Upload your first photo to stand out."
                : "No photos to display."}
            </p>
            {isOwner && onUpload && (
              <Button
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-2xl bg-muted">
              <Image
                src={selectedUrl}
                alt={`Photo ${selectedIndex + 1}`}
                fill
                className="object-cover"
                unoptimized={selectedUrl.startsWith("data:")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {selectedIndex + 1} / {displayPhotos.length}
                </span>
                {selectedPhoto?.isMain && (
                  <Badge className="border-0 bg-rose-500/90 text-white">Main</Badge>
                )}
              </div>
              {isOwner && selectedPhoto && (
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8 bg-background/80 backdrop-blur-sm"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!selectedPhoto.isMain && onSetMain && (
                        <DropdownMenuItem
                          onClick={() => onSetMain(selectedPhoto.id)}
                        >
                          <Star className="mr-2 size-4" />
                          Set as main
                        </DropdownMenuItem>
                      )}
                      {onDelete && displayPhotos.length > 0 && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(selectedPhoto.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {displayPhotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {displayPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all ${
                      selectedIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={photo.url.startsWith("data:")}
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
