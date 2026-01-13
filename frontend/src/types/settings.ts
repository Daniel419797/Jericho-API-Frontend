export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface CreateApiKeyData {
  name: string;
  expiresInDays?: number;
}
