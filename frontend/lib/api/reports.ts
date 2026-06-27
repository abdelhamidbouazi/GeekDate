import type { ApiErrorBody } from "@/types/api"
import { ApiError } from "@/lib/api/http"

export function reportFakeAccount(): Promise<never> {
  const body: ApiErrorBody = {
    message: "The backend does not expose a report endpoint.",
    status: 501,
    code: "UNKNOWN",
  }
  return Promise.reject(new ApiError(body))
}

