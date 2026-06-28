"use client"

import { useMemo, useState } from "react"

import type { Gender, PrivateMatchaProfile } from "@/types/profile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type EditableProfile = Pick<
  PrivateMatchaProfile,
  | "firstName"
  | "lastName"
  | "username"
  | "email"
  | "age"
  | "gender"
  | "sexualPreference"
  | "biography"
  | "interests"
>

interface ProfileEditDialogProps {
  profile: PrivateMatchaProfile
  onSave: (profile: EditableProfile) => void
}

export function ProfileEditDialog({ profile, onSave }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<EditableProfile>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    email: profile.email,
    age: profile.age,
    gender: profile.gender,
    sexualPreference: profile.sexualPreference,
    biography: profile.biography,
    interests: profile.interests,
  })

  const errors = useMemo(() => {
    const nextErrors: string[] = []
    if (!draft.firstName.trim()) nextErrors.push("First name is required.")
    if (!draft.lastName.trim()) nextErrors.push("Last name is required.")
    if (!draft.email.includes("@")) nextErrors.push("A valid email is required.")
    if (draft.biography.trim().length < 20) {
      nextErrors.push("Biography must be at least 20 characters.")
    }
    if (draft.interests.length === 0) nextErrors.push("Add at least one interest.")
    return nextErrors
  }, [draft])

  function updateField<Key extends keyof EditableProfile>(
    key: Key,
    value: EditableProfile[Key]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function save() {
    if (errors.length > 0) return
    onSave(draft)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit profile details</DialogTitle>
          <DialogDescription>
            Update the account and public dating details required by Matcha.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={draft.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={draft.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={draft.username}
              onChange={(event) => updateField("username", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={draft.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={18}
              value={draft.age}
              onChange={(event) => updateField("age", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={draft.gender}
              onValueChange={(value) => updateField("gender", value as Gender)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Woman">Woman</SelectItem>
                <SelectItem value="Man">Man</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Sexual preference</Label>
            <Select
              value={draft.sexualPreference}
              onValueChange={(value) =>
                updateField(
                  "sexualPreference",
                  value as EditableProfile["sexualPreference"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="Men">Men</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="biography">Biography</Label>
            <Textarea
              id="biography"
              rows={5}
              value={draft.biography}
              onChange={(event) => updateField("biography", event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="interests">Interest tags</Label>
            <Input
              id="interests"
              value={draft.interests.join(", ")}
              onChange={(event) =>
                updateField(
                  "interests",
                  event.target.value
                    .split(",")
                    .map((interest) => interest.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        </div>

        {errors.length > 0 ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={errors.length > 0}>
            Save updates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
