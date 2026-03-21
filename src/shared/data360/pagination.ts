import { Org } from '@salesforce/core';
import { ssotGet, SsotRequestOptions } from './ssotClient.js';

/*
 * Data 360 APIs use two pagination styles:
 *
 * 1. Offset-based: batchSize + offset query params
 *    Response: { data: [...], totalSize: N }
 *
 * 2. Cursor-based: nextBatchId in response
 *    Response: { data: [...], nextBatchId: "..." }
 *
 * This module handles both transparently.
 */

export type PaginatedResponse<T> = {
  data: T[];
  totalSize?: number;
  nextBatchId?: string;
  nextPageUrl?: string;
};

export type PaginationOptions = {
  /** Batch size per request (default: 200). */
  batchSize?: number;
  /** Fetch all pages automatically (default: false). */
  all?: boolean;
  /** Maximum total records to fetch (default: unlimited). */
  maxRecords?: number;
};

const DEFAULT_BATCH_SIZE = 200;

/**
 * Extract array data from a response that may have the data at the top level
 * or nested under a known key.
 */
const extractArray = <T>(response: unknown, arrayKey?: string): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    // Support dotted paths like "collection.items"
    if (arrayKey) {
      let current: unknown = obj;
      for (const segment of arrayKey.split('.')) {
        if (typeof current === 'object' && current !== null) {
          current = (current as Record<string, unknown>)[segment];
        } else {
          current = undefined;
          break;
        }
      }
      if (Array.isArray(current)) return current as T[];
    }
    if (Array.isArray(obj.data)) return obj.data as T[];
    // Some endpoints return the array at a domain-specific key
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
};

/**
 * Fetch a single page from a list endpoint.
 * Sends both `batchSize` and `limit` params to support all API styles.
 */
export const fetchPage = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  offset: number,
  batchSize: number,
  options?: SsotRequestOptions,
  arrayKey?: string
): Promise<PaginatedResponse<T>> => {
  const sep = endpoint.includes('?') ? '&' : '?';
  // Some endpoints use `batchSize`, others use `limit` — send both
  const url = `${endpoint}${sep}batchSize=${batchSize}&limit=${batchSize}&offset=${offset}`;
  const response = await ssotGet<Record<string, unknown>>(org, apiVersion, url, options);
  return {
    data: extractArray<T>(response, arrayKey),
    totalSize: typeof response.totalSize === 'number' ? response.totalSize : undefined,
    nextBatchId: typeof response.nextBatchId === 'string' ? response.nextBatchId : undefined,
    nextPageUrl: typeof response.nextPageUrl === 'string' ? response.nextPageUrl : undefined,
  };
};

/** Parse raw API response into a PaginatedResponse. */
const toPage = <T>(response: Record<string, unknown>, arrayKey?: string): PaginatedResponse<T> => ({
  data: extractArray<T>(response, arrayKey),
  totalSize: typeof response.totalSize === 'number' ? response.totalSize : undefined,
  nextBatchId: typeof response.nextBatchId === 'string' ? response.nextBatchId : undefined,
  nextPageUrl: typeof response.nextPageUrl === 'string' ? response.nextPageUrl : undefined,
});

/** Strip the /services/data/vNN.0/ssot prefix from a nextPageUrl (ssotGet adds it). */
const stripSsotPrefix = (url: string, apiVersion: string): string => {
  const prefix = `/services/data/v${apiVersion}/ssot`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : url;
};

/** Fetch next page via URL or cursor, returning null if no more pages. */
const fetchNextPage = async <T>(
  org: Org,
  apiVersion: string,
  page: PaginatedResponse<T>,
  endpoint: string,
  batchSize: number,
  requestOptions: SsotRequestOptions | undefined,
  arrayKey: string | undefined
): Promise<PaginatedResponse<T> | null> => {
  // Style 1: follow nextPageUrl
  if (page.nextPageUrl) {
    const next = stripSsotPrefix(page.nextPageUrl, apiVersion);
    // eslint-disable-next-line no-await-in-loop
    const response = await ssotGet<Record<string, unknown>>(org, apiVersion, next, requestOptions);
    return toPage<T>(response, arrayKey);
  }
  // Style 2: follow nextBatchId
  if (page.nextBatchId) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${endpoint}${sep}batchSize=${batchSize}&nextBatchId=${encodeURIComponent(page.nextBatchId)}`;
    // eslint-disable-next-line no-await-in-loop
    const response = await ssotGet<Record<string, unknown>>(org, apiVersion, url, requestOptions);
    return toPage<T>(response, arrayKey);
  }
  return null;
};

/**
 * Fetch all pages from an endpoint, handling three pagination styles:
 * 1. nextPageUrl (data-streams, etc.) — follow the URL directly
 * 2. nextBatchId (cursor-based)
 * 3. offset-based (batchSize/limit + offset)
 */
export const fetchAllPages = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  paginationOptions?: PaginationOptions,
  requestOptions?: SsotRequestOptions,
  arrayKey?: string
): Promise<T[]> => {
  const batchSize = paginationOptions?.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxRecords = paginationOptions?.maxRecords ?? Infinity;
  const all: T[] = [];

  // First page
  let page = await fetchPage<T>(org, apiVersion, endpoint, 0, batchSize, requestOptions, arrayKey);
  all.push(...page.data);

  // Follow pages
  while (all.length < maxRecords) {
    // Try nextPageUrl or nextBatchId
    // eslint-disable-next-line no-await-in-loop
    const next = await fetchNextPage<T>(org, apiVersion, page, endpoint, batchSize, requestOptions, arrayKey);
    if (next) {
      if (next.data.length === 0) break;
      all.push(...next.data);
      page = next;
      continue;
    }

    // Style 3: offset-based — infer from totalSize or data length
    if (page.totalSize !== undefined && all.length >= page.totalSize) break;
    if (page.data.length < batchSize) break;

    // eslint-disable-next-line no-await-in-loop
    page = await fetchPage<T>(org, apiVersion, endpoint, all.length, batchSize, requestOptions, arrayKey);
    if (page.data.length === 0) break;
    all.push(...page.data);
  }

  return all.length > maxRecords ? all.slice(0, maxRecords) : all;
};
