import { apiClient } from './api-client';
import {
  MarketplaceApp,
  MarketplaceInstall,
  MarketplaceInstallEnriched,
  SubmitAppPayload,
  InstallAppPayload,
} from '@/types/marketplace';

/**
 * List all public/approved marketplace apps
 */
export async function listApps(): Promise<MarketplaceApp[]> {
  return apiClient.request<MarketplaceApp[]>('/marketplace/apps', { method: 'GET' });
}

/**
 * Get a single marketplace app by ID
 */
export async function getApp(id: string): Promise<MarketplaceApp> {
  return apiClient.request<MarketplaceApp>(`/marketplace/apps/${id}`, { method: 'GET' });
}

/**
 * Submit a new app to the marketplace (requires authentication)
 */
export async function submitApp(
  payload: SubmitAppPayload
): Promise<{ app: MarketplaceApp; lintWarnings?: string[] }> {
  return apiClient.request<{ app: MarketplaceApp; lintWarnings?: string[] }>(
    '/marketplace/apps',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Install an app into a project
 */
export async function installApp(
  appId: string,
  payload: InstallAppPayload
): Promise<{ install: MarketplaceInstall; paymentIntent?: unknown }> {
  return apiClient.request<{ install: MarketplaceInstall; paymentIntent?: unknown }>(
    `/marketplace/apps/${appId}/install`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Admin: List all apps (including pending/rejected)
 */
export async function adminListApps(): Promise<MarketplaceApp[]> {
  return apiClient.request<MarketplaceApp[]>('/marketplace/admin/apps', { method: 'GET' });
}

/**
 * Admin: Approve an app
 */
export async function approveApp(
  appId: string
): Promise<{ status: string; captureResults?: unknown[] }> {
  return apiClient.request<{ status: string; captureResults?: unknown[] }>(
    `/marketplace/apps/${appId}/approve`,
    { method: 'POST', body: JSON.stringify({}) }
  );
}

/**
 * Admin: List all installs with enriched data
 */
export async function adminListInstalls(): Promise<MarketplaceInstallEnriched[]> {
  return apiClient.request<MarketplaceInstallEnriched[]>('/marketplace/admin/installs', {
    method: 'GET',
  });
}

export const marketplaceService = {
  listApps,
  getApp,
  submitApp,
  installApp,
  adminListApps,
  approveApp,
  adminListInstalls,
};
