"use client"

import { Ban, Flag, Heart, MessageCircle, Unlink } from "lucide-react"

import type { RelationshipState } from "@/types/profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ProfileActionsProps {
  relationship: RelationshipState
  hasProfilePicture: boolean
  onLike: () => void
  onUnlike: () => void
  onReport: () => void
  onBlock: () => void
  onMessage: () => void
}

export function ProfileActions({
  relationship,
  hasProfilePicture,
  onLike,
  onUnlike,
  onReport,
  onBlock,
  onMessage,
}: ProfileActionsProps) {
  return (
    <div className="space-y-3">
      {!hasProfilePicture ? (
        <Alert>
          <Heart className="size-4" />
          <AlertTitle>Profile picture required</AlertTitle>
          <AlertDescription>
            Matcha requires your own profile picture before you can like another user.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {relationship.likedByMe ? (
          <Button variant="outline" onClick={onUnlike}>
            <Unlink className="size-4" />
            Unlike / disconnect
          </Button>
        ) : (
          <Button disabled={!hasProfilePicture} onClick={onLike}>
            <Heart className="size-4" />
            Like profile picture
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={!relationship.connected}
          onClick={onMessage}
        >
          <MessageCircle className="size-4" />
          Message
        </Button>
        <Button variant="outline" onClick={onReport}>
          <Flag className="size-4" />
          Report fake account
        </Button>
        <Button variant="destructive" onClick={onBlock}>
          <Ban className="size-4" />
          Block user
        </Button>
      </div>
    </div>
  )
}
