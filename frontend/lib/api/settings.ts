import { updateProfile, type UpdateProfilePayload } from "@/lib/api/profile"

export function updateSettings(payload: UpdateProfilePayload) {
  return updateProfile(payload)
}

