import { apiClient } from './api-client';
import { AdminUser, Role, InviteUserData, UpdateUserRoleData, UserListParams } from '@/types/admin';
import { PaginatedResponse } from '@/types/project';

// Types for admin endpoints
export interface SystemDashboard {
  users: number;
  projects: number;
  apiKeys: number;
  activeStreams: number;
  uptime: number;
}

export interface CachedProject {
  id: string;
  name: string;
  cachedAt: string;
}

export interface RotationResult {
  ok: boolean;
  message?: string;
  rotatedAt?: string;
}

export interface RotationLogEntry {
  timestamp: string;
  action: string;
  projectId?: string;
  success: boolean;
  message?: string;
}

export interface StreamInfo {
  projectId: string;
  collection: string;
  status: 'running' | 'stopped' | 'error';
  lastEvent?: string;
}

export interface InstalledModule {
  name: string;
  version: string;
  enabled: boolean;
  scope?: string;
}

export interface ModulesHealth {
  ok: boolean;
  modules: Array<{
    name: string;
    version: string;
    status: 'ready' | 'starting' | 'loaded' | 'exited' | 'error';
    pid?: number;
    error?: string;
  }>;
  summary: {
    total: number;
    ready: number;
    started: number;
    exited: number;
  };
}

export async function getUsers(params?: UserListParams): Promise<PaginatedResponse<AdminUser>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.role) queryParams.append('role', params.role);
  if (params?.status) queryParams.append('status', params.status);

  const query = queryParams.toString();
  // Backend uses /api/v1/users with admin middleware
  return apiClient.request<PaginatedResponse<AdminUser>>(`/users${query ? `?${query}` : ''}`, { method: 'GET' });
}

export async function updateUserRole(data: UpdateUserRoleData): Promise<AdminUser> {
  return apiClient.request<AdminUser>(`/users/${data.userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role: data.role }),
  });
}

export async function inviteUser(data: InviteUserData): Promise<void> {
  // Use auth/invite endpoint for invitations
  return apiClient.request<void>('/auth/invite', { method: 'POST', body: JSON.stringify(data) });
}

export async function getRoles(): Promise<Role[]> {
  return apiClient.request<Role[]>('/roles', { method: 'GET' });
}

export async function deleteUser(userId: string): Promise<void> {
  return apiClient.request<void>(`/users/${userId}`, { method: 'DELETE' });
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<AdminUser> {
  return apiClient.request<AdminUser>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// System admin endpoints
export async function getSystemDashboard(): Promise<SystemDashboard> {
  return apiClient.request<SystemDashboard>('/admin/dashboard', { method: 'GET' });
}

export async function getCachedProjects(): Promise<CachedProject[]> {
  return apiClient.request<CachedProject[]>('/admin/cache/projects', { method: 'GET' });
}

export async function invalidateCacheProject(projectId: string): Promise<void> {
  return apiClient.request<void>(`/admin/cache/invalidate/${projectId}`, { method: 'POST' });
}

export async function rotateDbCredentials(projectId?: string, dryRun?: boolean): Promise<RotationResult> {
  return apiClient.request<RotationResult>('/admin/rotate/db', {
    method: 'POST',
    body: JSON.stringify({ projectId, dryRun }),
  });
}

export async function rotateSecrets(projectId?: string, dryRun?: boolean): Promise<RotationResult> {
  return apiClient.request<RotationResult>('/admin/rotate/secrets', {
    method: 'POST',
    body: JSON.stringify({ projectId, dryRun }),
  });
}

export async function getRotationLog(lines?: number): Promise<RotationLogEntry[]> {
  const query = lines ? `?lines=${lines}` : '';
  return apiClient.request<RotationLogEntry[]>(`/admin/rotation/log${query}`, { method: 'GET' });
}

export async function getStreams(projectId?: string): Promise<StreamInfo[]> {
  const query = projectId ? `?projectId=${projectId}` : '';
  return apiClient.request<StreamInfo[]>(`/admin/streams${query}`, { method: 'GET' });
}

export async function startStream(projectId: string, collection: string): Promise<StreamInfo> {
  return apiClient.request<StreamInfo>('/admin/streams/start', {
    method: 'POST',
    body: JSON.stringify({ projectId, collection }),
  });
}

export async function stopStream(projectId: string, collection: string): Promise<StreamInfo> {
  return apiClient.request<StreamInfo>('/admin/streams/stop', {
    method: 'POST',
    body: JSON.stringify({ projectId, collection }),
  });
}

export async function getInstalledModules(): Promise<InstalledModule[]> {
  return apiClient.request<InstalledModule[]>('/admin/modules', { method: 'GET' });
}

export async function getModulesHealth(): Promise<ModulesHealth> {
  return apiClient.request<ModulesHealth>('/admin/modules/health', { method: 'GET' });
}

export const adminService = {
  getUsers,
  updateUserRole,
  inviteUser,
  getRoles,
  deleteUser,
  updateUserStatus,
  getSystemDashboard,
  getCachedProjects,
  invalidateCacheProject,
  rotateDbCredentials,
  rotateSecrets,
  getRotationLog,
  getStreams,
  startStream,
  stopStream,
  getInstalledModules,
  getModulesHealth,
};
