import { apiClient } from '@/services/api-client';

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName?: string;
    date: string;
    checkIn?: string | null;
    checkOut?: string | null;
    status: string;
    hoursWorked?: number;
}

export interface CreateAttendanceData {
    userId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status?: string;
}

export interface UpdateAttendanceData {
    checkIn?: string;
    checkOut?: string;
    status?: string;
}

export const attendanceService = {
    getAttendance: async (date?: string): Promise<AttendanceRecord[]> => {
        const q = date ? `?date=${encodeURIComponent(date)}` : '';
        return apiClient.request(`/attendance${q}`) as Promise<AttendanceRecord[]>;
    },

    getAttendanceById: async (id: string): Promise<AttendanceRecord> => {
        return apiClient.request(`/attendance/${id}`) as Promise<AttendanceRecord>;
    },

    createAttendance: async (data: CreateAttendanceData): Promise<AttendanceRecord> => {
        return apiClient.request('/attendance', {
            method: 'POST',
            body: JSON.stringify(data),
        }) as Promise<AttendanceRecord>;
    },

    updateAttendance: async (id: string, data: UpdateAttendanceData): Promise<AttendanceRecord> => {
        return apiClient.request(`/attendance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }) as Promise<AttendanceRecord>;
    },

    deleteAttendance: async (id: string): Promise<void> => {
        return apiClient.request(`/attendance/${id}`, { method: 'DELETE' }) as Promise<void>;
    },
};
