import {
  completeBasicProfile,
  completePreferences,
  deleteProfilePhoto,
  getConnectedProfile,
  setLocation,
  setMainProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
  type ConnectedUserProfile,
  type UpdateProfilePayload,
  type UploadedPhotoDto,
} from "./profile"

export type { ConnectedUserProfile, UpdateProfilePayload, UploadedPhotoDto }

export const settingsApi = {
  getConnectedProfile,
  updateProfile,
  setLocation,
  completeBasicProfile,
  completePreferences,
  uploadPhoto: uploadProfilePhoto,
  deletePhoto: deleteProfilePhoto,
  setMainPhoto: setMainProfilePhoto,
}

