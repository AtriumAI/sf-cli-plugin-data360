export const DEFAULT_API_VERSION = '66.0';

export const normalizeApiVersion = (apiVersion: string): string => apiVersion.trim().replace(/^v/i, '');

export const buildSsotPath = (apiVersion: string, endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/services/data/v${normalizeApiVersion(apiVersion)}/ssot${normalizedEndpoint}`;
};
