import { clearAuthCookie } from "./auth-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type RequestOptions = RequestInit & { _skip401Refresh?: boolean };

async function rawFetch(
  path: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { _skip401Refresh, ...fetchOptions } = options;
  const url = `${BASE_URL}${path}`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const isFormData = fetchOptions.body instanceof FormData;
  return fetch(url, {
    ...fetchOptions,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  });
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await rawFetch(path, options);

  if (res.status === 401 && !options._skip401Refresh) {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;
    if (!refreshToken) {
      clearAndRedirect();
      throw new Error("Session expired");
    }

    const refreshRes = await rawFetch("/api/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken),
      _skip401Refresh: true,
    });

    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as { data?: string };
      const newToken = data?.data;
      if (newToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", newToken);
      }
      return request<T>(path, options);
    }
    clearAndRedirect();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    throw new Error(await res.text().catch(() => res.statusText));
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json();
}

function clearAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  clearAuthCookie();
  window.location.href = "/login";
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  postFormData: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
  putFormData: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "PUT", body: formData }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
