import { tokenStorage } from '@/utils/token-storage';
import { AuthResponse, LoginCredentials, User } from '@/types/auth';
import { DashboardData } from '@/types/dashboard';
import {
  Project,
  ProjectMember,
  ProjectFile,
  ProjectListParams,
  PaginatedResponse,
} from '@/types/project';
import { Channel, Message, SendMessageData, MessageListParams } from '@/types/message';
import { AdminUser, Role, InviteUserData, UpdateUserRoleData, UserListParams } from '@/types/admin';
import { UserProfile, UpdateProfileData, ApiKey, CreateApiKeyData } from '@/types/settings';
import { UploadResponse } from '@/types/file';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;
  private refreshingToken: Promise<string> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data.tokens;

    tokenStorage.setTokens({ accessToken, refreshToken: newRefreshToken });
    return accessToken;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = tokenStorage.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && tokenStorage.getRefreshToken()) {
      try {
        // Prevent multiple simultaneous refresh requests
        if (!this.refreshingToken) {
          this.refreshingToken = this.refreshAccessToken();
        }

        const newAccessToken = await this.refreshingToken;
        this.refreshingToken = null;

        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        this.refreshingToken = null;
        throw error;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'GET',
    });
  }

  // Dashboard
  async getDashboardData(): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard', {
      method: 'GET',
    });
  }

  // Projects
  async getProjects(params?: ProjectListParams): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Project>>(
      `/projects${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'GET',
    });
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return this.request<ProjectMember[]>(`/projects/${projectId}/members`, {
      method: 'GET',
    });
  }

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return this.request<ProjectFile[]>(`/projects/${projectId}/files`, {
      method: 'GET',
    });
  }

  async createProject(data: { name: string; description: string }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Messaging
  async getChannels(): Promise<Channel[]> {
    return this.request<Channel[]>('/channels', {
      method: 'GET',
    });
  }

  async getMessages(params: MessageListParams): Promise<PaginatedResponse<Message>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.before) queryParams.append('before', params.before);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Message>>(
      `/channels/${params.channelId}/messages${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    const formData = new FormData();
    formData.append('content', data.content);

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const accessToken = tokenStorage.getAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/channels/${data.channelId}/messages`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Files
  async uploadFile(file: File, projectId: string, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      const accessToken = tokenStorage.getAccessToken();
      xhr.open('POST', `${this.baseUrl}/projects/${projectId}/files`);
      if (accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      }

      xhr.send(formData);
    });
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const accessToken = tokenStorage.getAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/files/${fileId}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    return response.blob();
  }

  // Admin
  async getUsers(params?: UserListParams): Promise<PaginatedResponse<AdminUser>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<AdminUser>>(
      `/admin/users${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async updateUserRole(data: UpdateUserRoleData): Promise<AdminUser> {
    return this.request<AdminUser>(`/admin/users/${data.userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: data.role }),
    });
  }

  async inviteUser(data: InviteUserData): Promise<void> {
    return this.request<void>('/admin/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoles(): Promise<Role[]> {
    return this.request<Role[]>('/admin/roles', {
      method: 'GET',
    });
  }

  // Settings
  async getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/settings/profile', {
      method: 'GET',
    });
  }

  async updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
    return this.request<UserProfile>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>('/settings/api-keys', {
      method: 'GET',
    });
  }

  async createApiKey(data: CreateApiKeyData): Promise<ApiKey> {
    return this.request<ApiKey>('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteApiKey(keyId: string): Promise<void> {
    return this.request<void>(`/settings/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
