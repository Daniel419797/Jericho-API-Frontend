import { API_BASE_URL, apiClient } from './api-client';
import { UploadResponse } from '@/types/file';
import { tokenStorage } from '@/utils/token-storage';

export interface FileMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  projectId?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function listFiles(): Promise<FileMetadata[]> {
  return apiClient.request<FileMetadata[]>('/files', { method: 'GET' });
}

export async function getFileMetadata(fileId: string): Promise<FileMetadata> {
  return apiClient.request<FileMetadata>(`/files/${fileId}`, { method: 'GET' });
}

export async function uploadFile(file: File, projectId?: string, onProgress?: (progress: number) => void): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId);
    }

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

    // Use the main files endpoint
    xhr.open('POST', `${API_BASE_URL}/files`);

    if (accessToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    }

    xhr.send(formData);
  });
}

export async function downloadFile(fileId: string): Promise<Blob> {
  const accessToken = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  return response.blob();
}

export async function deleteFile(fileId: string): Promise<void> {
  return apiClient.request(`/files/${fileId}`, { method: 'DELETE' }) as Promise<void>;
}

export const fileService = {
  listFiles,
  getFileMetadata,
  uploadFile,
  downloadFile,
  deleteFile,
};
