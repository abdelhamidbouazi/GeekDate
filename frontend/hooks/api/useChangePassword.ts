"use client"

export function useChangePassword() {
  return {
    supported: false,
    pending: false,
    changePassword: async () => {
      throw new Error("Password changes are not available in the backend.")
    },
  }
}

