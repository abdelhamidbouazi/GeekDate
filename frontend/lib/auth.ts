import { api } from "./api";

export interface ApiResponse<T> {
  isSucceeded?: boolean;
  data?: T;
  Data?: T;
  message?: string;
}

export interface LoginResponse {
    userName: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    isProfileCompleted: boolean;
    accessToken: string;
    refreshToken: string;
    profilePhotoUrl: string;
}

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    email: string;
}

export interface RegisterResponse {
    username: string;
    token: string;
}

function unwrapData<T>(r: ApiResponse<T>): T | undefined {
  return r?.data ?? (r as { Data?: T })?.Data;
}

export const authApi = {
    login: async (data: LoginRequest) => {
      const r = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
      return { ...r, data: unwrapData(r) ?? r?.data };
    },
  
    register: async (data: RegisterRequest) => {
      const r = await api.post<ApiResponse<RegisterResponse>>('/api/auth/register', data);
      return { ...r, data: unwrapData(r) ?? r?.data };
    },
  
    logout: () => api.post('/api/auth/logout'),

    /** Backend expects raw JSON string for email */
    forgotPassword: (email: string) =>
      api.post<ApiResponse<string>>('/api/auth/forgot-password', JSON.stringify(email)),

    resetPassword: (userId: string, code: string, newPassword: string) =>
      api.post<ApiResponse<string>>('/api/auth/reset-password', { userId, token: code, newPassword }),

    refreshToken: () => {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) return Promise.reject(new Error('No refresh token'));
      return api.post<ApiResponse<string>>('/api/auth/refresh-token', JSON.stringify(refreshToken));
    },

    confirmEmail: (userId: string, token: string) =>
      api.get<ApiResponse<string>>(`/api/auth/verify?userId=${userId}&token=${encodeURIComponent(token)}`),

    validateToken: () => api.get<{ message?: string; emailVerified?: boolean; profileCompleted?: boolean }>('/api/auth/validate-token'),
  };