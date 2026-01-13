export interface Channel {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  createdAt: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  channelId: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  updatedAt: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export interface SendMessageData {
  channelId: string;
  content: string;
  attachments?: File[];
}

export interface MessageListParams {
  channelId: string;
  page?: number;
  limit?: number;
  before?: string;
}
