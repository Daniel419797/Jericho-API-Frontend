import { apiClient, API_BASE_URL } from './api-client';
import { Channel, Message, SendMessageData, MessageListParams } from '@/types/message';
import { tokenStorage } from '@/utils/token-storage';

// Backend uses /messages endpoint with roomId query param
export async function getMessages(params: MessageListParams): Promise<Message[]> {
  const queryParams = new URLSearchParams();
  // Backend expects roomId not channelId
  if (params.channelId) queryParams.append('roomId', params.channelId);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.before) queryParams.append('before', params.before);

  const query = queryParams.toString();
  return apiClient.request<Message[]>(`/messages${query ? `?${query}` : ''}`, { method: 'GET' });
}

// Upload media via /messages/media
export async function uploadMedia(file: File): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const accessToken = tokenStorage.getAccessToken();

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/messages/media`, {
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

// Note: Channels are project-specific and may not have a dedicated endpoint
// They are typically managed through project metadata or a separate system
export async function getChannels(): Promise<Channel[]> {
  // This endpoint may need to be created in backend or use project metadata
  try {
    return await apiClient.request<Channel[]>('/messages/rooms', { method: 'GET' });
  } catch {
    // Fallback: return empty if rooms endpoint doesn't exist
    return [];
  }
}

export async function sendMessage(data: SendMessageData): Promise<Message> {
  const formData = new FormData();
  formData.append('content', data.content);
  formData.append('roomId', data.channelId);

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

  const response = await fetch(`${API_BASE_URL}/messages`, {
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

export const messagingService = { getChannels, getMessages, sendMessage, uploadMedia };
