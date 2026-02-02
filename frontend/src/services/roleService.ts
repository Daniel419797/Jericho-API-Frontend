import { apiClient } from './api-client';

export interface RoleCreatePayload {
  name: string;
  projectId: string;
  permissions?: string[];
  description?: string;
}

export interface RoleUpdatePayload {
  name?: string;
  permissions?: string[];
  description?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  projectId: string;
  permissions: string[];
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export async function listRoles(projectId?: string): Promise<RoleResponse[]> {
  const q = projectId ? `?projectId=${projectId}` : '';
  return apiClient.request<RoleResponse[]>(`/roles${q}`, { method: 'GET' });
}

export async function getRole(roleId: string): Promise<RoleResponse> {
  return apiClient.request<RoleResponse>(`/roles/${roleId}`, { method: 'GET' });
}

export async function createRole(payload: RoleCreatePayload): Promise<RoleResponse> {
  return apiClient.request<RoleResponse>('/roles', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateRole(roleId: string, payload: RoleUpdatePayload): Promise<RoleResponse> {
  return apiClient.request<RoleResponse>(`/roles/${roleId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteRole(roleId: string): Promise<void> {
  return apiClient.request(`/roles/${roleId}`, { method: 'DELETE' }) as Promise<void>;
}

export async function addPermission(roleId: string, permission: string): Promise<RoleResponse> {
  return apiClient.request<RoleResponse>(`/roles/${roleId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permission }),
  });
}

export async function removePermission(roleId: string, permissionId: string): Promise<void> {
  return apiClient.request(`/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' }) as Promise<void>;
}

export const roleService = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  addPermission,
  removePermission,
};
