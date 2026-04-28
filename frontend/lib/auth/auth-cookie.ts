const AUTH_COOKIE = "auth"

export function setAuthCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=2592000`
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`
}
