import { apiClient } from './api-client';
import { AuthResponse, LoginCredentials, User } from '@/types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function register(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout(refreshToken?: string): Promise<void> {
  return apiClient.request<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function verifyEmail(token: string): Promise<{ ok: boolean }> {
  return apiClient.request<{ ok: boolean }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function forgotPassword(email: string): Promise<{ ok: boolean; message?: string }> {
  return apiClient.request<{ ok: boolean; message?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
  return apiClient.request<{ ok: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.request<User>('/users/me', { method: 'GET' });
}

// Admin login using dev-admin-token endpoint
export async function adminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const adminCliKey = process.env.NEXT_PUBLIC_ADMIN_CLI_KEY || '';
  return apiClient.request<AuthResponse>('/auth/dev-admin-token', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: {
      'x-admin-cli-key': adminCliKey,
    },
  });
}

export const authService = {
  login,
  adminLogin,
  register,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
