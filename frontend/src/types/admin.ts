export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface InviteUserData {
  email: string;
  name: string;
  role: string;
}

export interface UpdateUserRoleData {
  userId: string;
  role: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
}
