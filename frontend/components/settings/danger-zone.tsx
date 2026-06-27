"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SettingsSection } from "@/components/settings/settings-section"

export function DangerZone() {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDisable = () => {
    toast.info("Account disable is not available yet. Contact support.")
  }

  const handleDeleteConfirm = () => {
    setDeleteOpen(false)
    toast.info(
      "Account deletion is not available via API yet. This action was not performed."
    )
  }

  return (
    <SettingsSection
      title="Danger Zone"
      description="Irreversible actions for your account."
      className="border-destructive/30"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div>
          <p className="font-medium">Disable account</p>
          <p className="text-sm text-muted-foreground">
            Temporarily hide your profile from others.
          </p>
        </div>
        <Button variant="outline" onClick={handleDisable} disabled>
          Disable account
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data.
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled>
          Delete account
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your photos, matches, and messages
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Yes, delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  )
}
