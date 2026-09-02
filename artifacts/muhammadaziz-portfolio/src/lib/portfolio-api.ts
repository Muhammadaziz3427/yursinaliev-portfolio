export type ActivityItem = {
  id?: string | number;
  timestamp?: string;
  action?: string;
  label?: string;
  detail?: string;
};

export type PortfolioPayload = {
  activity?: ActivityItem[];
  projects?: unknown[];
  essays?: unknown[];
  gallery?: unknown[];
};

export type AdminSummary = {
  projects?: number;
  essays?: number;
  gallery?: number;
  interactions?: number;
  recentActivity?: ActivityItem[];
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
};

export const getPortfolio = () => request<PortfolioPayload>('/api/portfolio');
export const getAdminSummary = () => request<AdminSummary>('/api/admin/summary');
export const postLike = (targetType: 'project' | 'essay', targetId: string) =>
  request<{ liked: boolean; likesCount: number | null }>('/api/interactions/like', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId }),
  });
export const postMagicLink = (email: string) =>
  request<{ sent: boolean }>('/api/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
export const postGoogleAuth = () => request<{ url?: string }>('/api/auth/google', { method: 'POST' });