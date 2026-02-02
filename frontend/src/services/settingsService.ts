import { apiClient } from './api-client';
import { UserProfile, UpdateProfileData, ApiKey, CreateApiKeyData } from '@/types/settings';

export async function getUserProfile(): Promise<UserProfile> {
  return apiClient.request<UserProfile>('/users/me', { method: 'GET' });
} 

export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  // Backend uses PUT not PATCH for /users/me
  return apiClient.request<UserProfile>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
} 

export async function getApiKeys(): Promise<ApiKey[]> {
  return apiClient.request<ApiKey[]>('/api-keys', { method: 'GET' });
}

export async function getApiKey(keyId: string): Promise<ApiKey> {
  return apiClient.request<ApiKey>(`/api-keys/${keyId}`, { method: 'GET' });
}

export async function createApiKey(data: CreateApiKeyData): Promise<ApiKey> {
  return apiClient.request<ApiKey>('/api-keys', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteApiKey(keyId: string): Promise<void> {
  return apiClient.request<void>(`/api-keys/${keyId}`, { method: 'DELETE' });
}

export async function revokeApiKey(keyId: string): Promise<void> {
  return apiClient.request<void>(`/api-keys/${keyId}/revoke`, { method: 'POST' });
}

export const settingsService = {
  getUserProfile,
  updateUserProfile,
  getApiKeys,
  getApiKey,
  createApiKey,
  deleteApiKey,
  revokeApiKey,
};
