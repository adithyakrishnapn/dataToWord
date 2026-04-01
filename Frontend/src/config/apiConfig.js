const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const API_ROOT = rawApiBaseUrl.replace(/\/$/, '');

export const PILLAR1_API_BASE_URL = API_ROOT ? `${API_ROOT}/pillar1` : '/pillar1';

export function toAbsoluteApiUrl(pathValue) {
  if (!pathValue) return '';
  if (/^https?:\/\//i.test(pathValue)) return pathValue;

  const normalizedPath = String(pathValue).startsWith('/') ? pathValue : `/${pathValue}`;
  return API_ROOT ? `${API_ROOT}${normalizedPath}` : normalizedPath;
}
