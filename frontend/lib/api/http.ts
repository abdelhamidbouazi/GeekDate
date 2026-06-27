import { clearAuthCookie } from "@/lib/auth/auth-cookie"
import type { ApiErrorBody, ApiErrorCode } from "@/types/api"

const DEFAULT_API_URL = "http://localhost:8082/api"

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "")
}

export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api$/i, "")
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl()
  const cleanPath = path.replace(/^\/+/, "")
  if (base.endsWith("/api") && cleanPath.toLowerCase().startsWith("api/")) {
    return `${base}/${cleanPath.slice(4)}`
  }
  return `${base}/${cleanPath}`
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST"
  if (status === 401) return "UNAUTHORIZED"
  if (status === 403) return "FORBIDDEN"
  if (status === 404) return "NOT_FOUND"
  if (status >= 500) return "SERVER_ERROR"
  return "UNKNOWN"
}

function extractMessages(errors: unknown): string[] {
  if (!errors || typeof errors !== "object") return []
  return Object.values(errors as Record<string, unknown>).flatMap((value) => {
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
    return typeof value === "string" ? [value] : []
  })
}

function parseErrorText(text: string, status: number): ApiErrorBody {
  if (text.trim()) {
    try {
      const json = JSON.parse(text) as Record<string, unknown>
      const errors = extractMessages(json.errors ?? json.Errors)
      const message =
        errors.join(". ") ||
        (typeof json.message === "string" ? json.message : "") ||
        (typeof json.Message === "string" ? json.Message : "") ||
        (typeof json.title === "string" ? json.title : "")
      if (message.trim()) {
        return { message, status, code: statusToCode(status), details: json }
      }
    } catch {
      if (text.length < 240 && !text.includes("Exception") && !text.includes(" at ")) {
        return { message: text, status, code: statusToCode(status) }
      }
    }
  }

  const message =
    status === 400
      ? "The request was rejected by the server."
      : status === 401
        ? "Your session expired. Please sign in again."
        : status === 403
          ? "You are not allowed to perform this action."
          : status === 404
            ? "This resource is not available."
            : status >= 500
              ? "The server failed to complete this request."
              : "Something went wrong."

  return { message, status, code: statusToCode(status) }
}

export class ApiError extends Error {
  status: number
  code: ApiErrorCode
  details?: unknown

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.name = "ApiError"
    this.status = body.status
    this.code = body.code
    this.details = body.details
  }
}

type RequestOptions = RequestInit & { skipAuthRefresh?: boolean }

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("accessToken")?.trim()
  return token || null
}

function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
  clearAuthCookie()
}

function buildHeaders(headers: HeadersInit | undefined, body: BodyInit | null | undefined): Headers {
  const result = new Headers(headers)
  if (!(body instanceof FormData) && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json")
  }
  const token = getAccessToken()
  if (token) result.set("Authorization", `Bearer ${token}`)
  return result
}

async function rawRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  const init: RequestInit = { ...options }
  delete (init as RequestOptions).skipAuthRefresh
  return fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init.headers, init.body),
  })
}

function unwrapData<T>(value: unknown): T {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    if ("data" in record) return record.data as T
    if ("Data" in record) return record.Data as T
  }
  return value as T
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) return false

  const response = await rawRequest("/api/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify(refreshToken),
    skipAuthRefresh: true,
  })

  if (!response.ok) return false
  const json = (await response.json().catch(() => null)) as { data?: string; Data?: string } | null
  const token = json?.data ?? json?.Data
  if (!token) return false
  localStorage.setItem("accessToken", token.trim())
  return true
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawRequest(path, options)

  if (response.status === 401 && !options.skipAuthRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) response = await rawRequest(path, options)
    else {
      clearSession()
      if (typeof window !== "undefined") window.location.href = "/login"
      throw new ApiError({ message: "Your session expired. Please sign in again.", status: 401, code: "UNAUTHORIZED" })
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new ApiError(parseErrorText(text, response.status))
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T
  }

  const text = await response.text()
  if (!text.trim()) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}

export { unwrapData }
