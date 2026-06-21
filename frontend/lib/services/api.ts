import { clearAuthCookie } from "@/lib/auth/auth-cookie"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5266"

function parseErrorMessage(text: string, status: number): string {
  if (!text?.trim())
    return status === 500 ? "Server error. Please try again." : "Something went wrong."
  try {
    const json = JSON.parse(text) as {
      Message?: string
      message?: string
      errors?: Record<string, string | string[]>
    }
    const errors = json.errors
    if (errors && typeof errors === "object") {
      const messages = Object.values(errors)
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .filter((s): s is string => typeof s === "string")
      if (messages.length > 0) return messages.join(". ")
    }
    const msg = json.Message ?? json.message
    if (typeof msg === "string" && msg.trim()) return msg
  } catch {
    if (text.length < 200 && !text.includes("at ") && !text.includes("Exception"))
      return text
  }
  return status === 500
    ? "Server error. Please try again."
    : "Something went wrong. Please try again."
}

type RequestOptions = RequestInit & { _skip401Refresh?: boolean }

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("accessToken")
  if (!raw) return null
  const t = raw.trim()
  return t.length > 0 ? t : null
}

function buildHeaders(
  init: HeadersInit | undefined,
  options: { isFormData: boolean; bearer: string | null }
): Headers {
  const h = new Headers(init)
  if (!options.isFormData && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json")
  }
  if (options.bearer) {
    h.set("Authorization", `Bearer ${options.bearer}`)
  }
  return h
}

async function rawFetch(
  path: string,
  options: RequestOptions = {}
): Promise<Response> {
  const fetchOptions: RequestInit = { ...options }
  delete (fetchOptions as RequestOptions & { _skip401Refresh?: boolean })
    ._skip401Refresh
  const url = `${BASE_URL}${path}`
  const token = getAccessToken()
  const isFormData = fetchOptions.body instanceof FormData

  return fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(fetchOptions.headers, {
      isFormData,
      bearer: token,
    }),
  })
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await rawFetch(path, options)

  if (res.status === 401 && !options._skip401Refresh) {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null
    if (!refreshToken) {
      clearAndRedirect()
      throw new Error("Session expired")
    }

    const refreshRes = await rawFetch("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(refreshToken),
      _skip401Refresh: true,
    })

    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as { data?: string }
      const newToken = data?.data
      if (newToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", newToken.trim())
      }
      return request<T>(path, options)
    }
    clearAndRedirect()
    throw new Error("Session expired")
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    const message = parseErrorMessage(text, res.status)
    throw new Error(message)
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T
  }
  return res.json()
}

function clearAndRedirect() {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
  clearAuthCookie()
  window.location.href = "/login"
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  postFormData: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
  putFormData: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "PUT", body: formData }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}
