export interface DashboardStats {
  projectsCount: number;
  unreadMessagesCount: number;
  activeProjectsCount: number;
  usersCount?: number;
  apiRequestsCount?: number | string;
}

export interface RecentActivity {
  id: string;
  type: 'project_created' | 'message_sent' | 'file_uploaded' | 'member_joined';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}
