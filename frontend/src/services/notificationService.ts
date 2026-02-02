import { apiClient } from '@/services/api-client';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    userId?: string;
    metadata?: Record<string, unknown>;
}

export interface SendNotificationData {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        return apiClient.request('/notifications') as Promise<Notification[]>;
    },

    getNotification: async (id: string): Promise<Notification> => {
        return apiClient.request(`/notifications/${id}`) as Promise<Notification>;
    },

    sendNotification: async (data: SendNotificationData): Promise<Notification> => {
        return apiClient.request('/notifications', {
            method: 'POST',
            body: JSON.stringify(data),
        }) as Promise<Notification>;
    },

    markAsRead: async (id: string): Promise<void> => {
        return apiClient.request(`/notifications/${id}/read`, { method: 'POST' }) as Promise<void>;
    },

    deleteNotification: async (id: string): Promise<void> => {
        return apiClient.request(`/notifications/${id}`, { method: 'DELETE' }) as Promise<void>;
    },
};
