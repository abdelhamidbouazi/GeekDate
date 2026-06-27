import { apiClient, unwrapData } from "./client"
import { endpoints } from "./endpoints"

export interface ApiResponse<T> {
  isSucceeded?: boolean
  IsSucceeded?: boolean
  data?: T
  Data?: T
  message?: string
  Message?: string
}

export interface LoginResponse {
  userName: string
  firstName: string
  lastName: string
  isEmailVerified: boolean
  isProfileCompleted: boolean
  accessToken: string
  refreshToken: string
  profilePhotoUrl: string
}

type RawLoginResponse = LoginResponse & {
  UserName?: string
  FirstName?: string
  LastName?: string
  IsEmailVerified?: boolean
  IsProfileCompleted?: boolean
  AccessToken?: string
  RefreshToken?: string
  ProfilePhotoUrl?: string
}

export interface LoginRequest {
  userName: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  userName: string
  password: string
  email: string
}

export interface RegisterResponse {
  username: string
  Username?: string
  token: string
  Token?: string
}

export interface ValidateTokenResponse {
  message?: string
  emailVerified?: boolean
  profileCompleted?: boolean
}

function normalizeResponse<T>(r: ApiResponse<T>): ApiResponse<T> {
  return {
    ...r,
    isSucceeded: r.isSucceeded ?? r.IsSucceeded,
    message: r.message ?? r.Message,
    data: unwrapData(r),
  }
}

function normalizeLoginResponse(data: RawLoginResponse): LoginResponse {
  return {
    userName: data.userName ?? data.UserName ?? "",
    firstName: data.firstName ?? data.FirstName ?? "",
    lastName: data.lastName ?? data.LastName ?? "",
    isEmailVerified: data.isEmailVerified ?? data.IsEmailVerified ?? false,
    isProfileCompleted: data.isProfileCompleted ?? data.IsProfileCompleted ?? false,
    accessToken: data.accessToken ?? data.AccessToken ?? "",
    refreshToken: data.refreshToken ?? data.RefreshToken ?? "",
    profilePhotoUrl: data.profilePhotoUrl ?? data.ProfilePhotoUrl ?? "",
  }
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const r = await apiClient.post<ApiResponse<RawLoginResponse>>(endpoints.auth.login, data)
    const normalized = normalizeResponse(r)
    return {
      ...normalized,
      data: normalized.data ? normalizeLoginResponse(normalized.data) : undefined,
    }
  },

  register: async (data: RegisterRequest) => {
    const r = await apiClient.post<ApiResponse<RegisterResponse>>(endpoints.auth.register, data)
    return normalizeResponse(r)
  },

  logout: () => apiClient.post<void>(endpoints.auth.logout),

  forgotPassword: (email: string) => apiClient.post<ApiResponse<string>>(endpoints.auth.forgotPassword, email),

  resetPassword: (userId: string, code: string, newPassword: string) =>
    apiClient.post<ApiResponse<string>>(endpoints.auth.resetPassword, {
      userId,
      token: code,
      newPassword,
    }),

  refreshToken: () => {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
    if (!refreshToken) return Promise.reject(new Error("No refresh token"))
    return apiClient.post<ApiResponse<string>>(endpoints.auth.refreshToken, refreshToken)
  },

  confirmEmail: (userId: string, token: string) =>
    apiClient.get<ApiResponse<string>>(
      `${endpoints.auth.verify}?userId=${userId}&token=${encodeURIComponent(token)}`
    ),

  validateToken: () => apiClient.get<ValidateTokenResponse>(endpoints.auth.validateToken),
}
