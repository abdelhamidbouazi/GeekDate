export type ApiErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR" | "UNKNOWN"

export interface ApiErrorBody {
  message: string
  status: number
  code: ApiErrorCode
  details?: unknown
}

export interface ApiEnvelope<T> {
  data?: T
  Data?: T
  succeeded?: boolean
  Succeeded?: boolean
  message?: string
  Message?: string
  errors?: Record<string, string | string[]>
  Errors?: Record<string, string | string[]>
}

export type ApiResult<T> = T | ApiEnvelope<T>
