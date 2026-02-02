import { apiClient } from './api-client';

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  description?: string;
}

export interface Schema {
  id: string;
  name: string;
  projectId: string;
  fields: SchemaField[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchemaData {
  name: string;
  projectId?: string;
  fields: SchemaField[];
  description?: string;
}

export interface UpdateSchemaData {
  name?: string;
  fields?: SchemaField[];
  description?: string;
}

export async function listSchemas(projectId?: string): Promise<Schema[]> {
  const query = projectId ? `?projectId=${projectId}` : '';
  return apiClient.request<Schema[]>(`/schemas${query}`, { method: 'GET' });
}

export async function getSchema(id: string): Promise<Schema> {
  return apiClient.request<Schema>(`/schemas/${id}`, { method: 'GET' });
}

export async function createSchema(data: CreateSchemaData): Promise<Schema> {
  return apiClient.request<Schema>('/schemas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSchema(id: string, data: UpdateSchemaData): Promise<Schema> {
  return apiClient.request<Schema>(`/schemas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSchema(id: string): Promise<void> {
  return apiClient.request<void>(`/schemas/${id}`, { method: 'DELETE' });
}

export async function validateData(schemaId: string, data: Record<string, unknown>): Promise<{ valid: boolean; errors?: string[] }> {
  return apiClient.request<{ valid: boolean; errors?: string[] }>(`/schemas/${schemaId}/validate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export const schemaService = {
  listSchemas,
  getSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  validateData,
};
