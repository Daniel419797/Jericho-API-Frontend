import { apiClient } from './api-client';
import {
  Project,
  ProjectMember,
  ProjectFile,
  ProjectListParams,
  PaginatedResponse,
  ProjectResponse,
} from '@/types/project';

export async function getProjects(params?: ProjectListParams): Promise<PaginatedResponse<Project>> {
  // Allow forcing no-query behaviour via env when backend expects no params (e.g., hosted API)
  const forceNoParams = process.env.NEXT_PUBLIC_API_NO_PARAMS === 'true';

  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const query = queryParams.toString();

  // If forced, call endpoint without query params
  if (forceNoParams) {
    const callAndNormalize = async (path: string) => {
      const res: any = await apiClient.request<any>(path, { method: 'GET' });
      if (Array.isArray(res)) {
        return {
          data: res as Project[],
          total: res.length,
          page: 1,
          limit: res.length,
          totalPages: 1,
        } as PaginatedResponse<Project>;
      }
      return res as PaginatedResponse<Project>;
    };

    return callAndNormalize('/projects');
  }

  const callAndNormalize = async (path: string) => {
    const res: any = await apiClient.request<any>(path, { method: 'GET' });
    // If server returned an array of projects, normalize to PaginatedResponse
    if (Array.isArray(res)) {
      return {
        data: res as Project[],
        total: res.length,
        page: 1,
        limit: res.length,
        totalPages: 1,
      } as PaginatedResponse<Project>;
    }
    return res as PaginatedResponse<Project>;
  };

  try {
    return await callAndNormalize(`/projects${query ? `?${query}` : ''}`);
  } catch (err: any) {
    // Some backends may not expect query params; retry without them as a fallback
    if (query) {
      console.warn('getProjects: initial request failed, retrying without query params:', err?.message ?? err);
      return callAndNormalize('/projects');
    }
    throw err;
  }
}

export async function getMyProjects(): Promise<Project[]> {
  return apiClient.request<Project[]>('/users/me/projects', { method: 'GET' });
}

export async function getProject(projectId: string): Promise<Project> {
  return apiClient.request<Project>(`/projects/${projectId}`, { method: 'GET' });
}

export async function updateProject(projectId: string, data: Partial<{
  name: string;
  description?: string;
  databaseConfig?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}>): Promise<Project> {
  return apiClient.request<Project>(`/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function testDatabase(projectId: string, databaseConfig: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  return apiClient.request(`/projects/${projectId}/database/test`, { method: 'POST', body: JSON.stringify(databaseConfig) }) as Promise<{ ok: boolean; message?: string }>;
}

export async function patchRegistrationFields(projectId: string, fields: any[]): Promise<void> {
  return apiClient.request(`/projects/${projectId}/registration-fields`, { method: 'PATCH', body: JSON.stringify(fields) }) as Promise<void>;
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  try {
    return await apiClient.request<ProjectMember[]>(`/projects/${projectId}/members`, { method: 'GET' });
  } catch (err: any) {
    // If the module/route isn't enabled on the backend, treat as empty list
    if (err instanceof Error && (err.message.includes('404') || /not found/i.test(err.message))) {
      return [];
    }
    throw err;
  }
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  try {
    return await apiClient.request<ProjectFile[]>(`/projects/${projectId}/files`, { method: 'GET' });
  } catch (err: any) {
    if (err instanceof Error && (err.message.includes('404') || /not found/i.test(err.message))) {
      return [];
    }
    throw err;
  }
}

export async function createProject(data: {
  name: string;
  description?: string;
  ownerId?: string;
  databaseType?: string;
  databaseConfig?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<ProjectResponse> {
  // POST to v1 create endpoint per API spec
  return apiClient.request<ProjectResponse>('/projects', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteProject(projectId: string): Promise<void> {
  return apiClient.request(`/projects/${projectId}`, { method: 'DELETE' }) as Promise<void>;
}

export async function getProjectMetrics(projectId: string): Promise<any> {
  return apiClient.request<any>(`/projects/${projectId}/metrics`, { method: 'GET' });
}

export const projectService = {
  getProjects,
  getMyProjects,
  getProject,
  updateProject,
  testDatabase,
  patchRegistrationFields,
  getProjectMembers,
  getProjectFiles,
  createProject,
  deleteProject,
  getProjectMetrics,
};
