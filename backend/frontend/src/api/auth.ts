import api from './client';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest, TokenValidationResult } from '../types';

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<{ username: string; token: string }>>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  verifyEmail: (userId: string, token: string) =>
    api.get<ApiResponse<string>>(`/auth/verify?userId=${userId}&token=${encodeURIComponent(token)}`),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<string>>('/auth/forgot-password', JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' },
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<string>>('/auth/reset-password', data),

  validateToken: () =>
    api.get<TokenValidationResult>('/auth/validate-token'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<string>>('/auth/refresh-token', JSON.stringify(refreshToken)),

  logout: () =>
    api.post<ApiResponse<string>>('/auth/logout'),
};
