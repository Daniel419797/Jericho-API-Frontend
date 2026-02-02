import { apiClient } from './api-client';
import { DashboardData } from '@/types/dashboard';

export async function getDashboardData(): Promise<DashboardData> {
  const resp = await apiClient.request<any>(`/users/me/dashboard`, { method: 'GET' });

  const projectsTotal = resp.projects?.total ?? 0;
  const activeProjectsCount = resp.projects?.items?.length ?? 0;
  const unreadMessagesCount = resp.usage?.unreadMessagesCount ?? 0;

  return {
    stats: {
      projectsCount: projectsTotal,
      unreadMessagesCount,
      activeProjectsCount,
    },
    recentActivities: [],
  } as DashboardData;
}

export const dashboardService = { getDashboardData };
