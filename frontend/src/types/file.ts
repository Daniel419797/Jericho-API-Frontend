export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadFileData {
  file: File;
  projectId: string;
}

export interface UploadResponse {
  id: string;
  name: string;
  size: number;
  url: string;
}
