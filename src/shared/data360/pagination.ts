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
 * Fetch a single page from an offset-based list endpoint.
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
  const url = `${endpoint}${sep}batchSize=${batchSize}&offset=${offset}`;
  const response = await ssotGet<Record<string, unknown>>(org, apiVersion, url, options);
  return {
    data: extractArray<T>(response, arrayKey),
    totalSize: typeof response.totalSize === 'number' ? response.totalSize : undefined,
    nextBatchId: typeof response.nextBatchId === 'string' ? response.nextBatchId : undefined,
  };
};

/**
 * Fetch all pages from an endpoint, handling both pagination styles.
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
  let offset = 0;

  let hasMore = true;
  // eslint-disable-next-line no-await-in-loop
  while (hasMore) {
    // eslint-disable-next-line no-await-in-loop
    const page = await fetchPage<T>(org, apiVersion, endpoint, offset, batchSize, requestOptions, arrayKey);
    all.push(...page.data);

    if (all.length >= maxRecords) {
      return all.slice(0, maxRecords);
    }

    // Cursor-based: follow nextBatchId
    if (page.nextBatchId) {
      const sep = endpoint.includes('?') ? '&' : '?';
      const url = `${endpoint}${sep}batchSize=${batchSize}&nextBatchId=${encodeURIComponent(page.nextBatchId)}`;
      // eslint-disable-next-line no-await-in-loop
      const nextResponse = await ssotGet<Record<string, unknown>>(org, apiVersion, url, requestOptions);
      const nextData = extractArray<T>(nextResponse, arrayKey);
      all.push(...nextData);
      if (nextData.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize + nextData.length;
      }
      continue;
    }

    // Offset-based: check if we've gotten everything
    if (page.data.length < batchSize) {
      hasMore = false;
    } else if (page.totalSize !== undefined && all.length >= page.totalSize) {
      hasMore = false;
    } else {
      offset += batchSize;
    }
  }

  return all.length > maxRecords ? all.slice(0, maxRecords) : all;
};
