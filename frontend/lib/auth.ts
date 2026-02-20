import { api } from "./api";

export interface ApiResponse<T> {
    isSucceeded: boolean;
    data?: T;
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

export const authApi = {
    login: (data: LoginRequest) =>
      api.post<ApiResponse<LoginResponse>>('/api/auth/login', data),
  
    register: (data: RegisterRequest) =>
      api.post<ApiResponse<RegisterResponse>>('/api/auth/register', data),
  
    logout: () => api.post('/api/auth/logout'),

    forgotPassword: (email: string) =>
      api.post<ApiResponse<string>>('/api/auth/forgot-password', email),

    resetPassword: (userId: string, code: string, newPassword: string) =>
      api.post<ApiResponse<string>>('/api/auth/reset-password', { userId, token: code, newPassword }),

    refreshToken: () => {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) return Promise.reject(new Error('No refresh token'));
      return api.post<ApiResponse<string>>('/api/auth/refresh-token', refreshToken);
    },

    confirmEmail: (userId: string, token: string) =>
      api.get<ApiResponse<string>>(`/api/auth/verify?userId=${userId}&token=${encodeURIComponent(token)}`),

    validateToken: () => api.get<{ emailVerified: boolean; profileCompleted: boolean }>('/api/auth/validate-token'),
  };