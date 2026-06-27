import { request } from "./http"

export interface ImpersonateResponse {
  userId: string
  userName: string
  email: string
  token: string
  resetPasswordUrl: string
}

export function impersonateUser(identifier: string, devSecret: string) {
  return request<ImpersonateResponse>("/api/dev/impersonate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dev-Secret": devSecret.trim(),
    },
    body: JSON.stringify({ identifier }),
  })
}
