import { Org } from '@salesforce/core';
import { ssotGet, SsotRequestOptions } from './ssotClient.js';

/*
 * Data 360 APIs use three pagination styles:
 *
 * 1. Offset-based: batchSize + offset query params
 *    Response: { data: [...], totalSize: N }
 *
 * 2. Cursor-based: an opaque token echoed back as a query param
 *    Response: { data: [...], nextBatchId | nextPageToken | continuationToken: "..." }
 *
 * 3. URL-based: an absolute next-page URL
 *    Response: { data: [...], nextPageUrl: "..." }
 *
 * This module handles all three transparently.
 */

export type PaginatedResponse<T> = {
  data: T[];
  totalSize?: number;
  nextBatchId?: string;
  nextPageUrl?: string;
  nextPageToken?: string;
  continuationToken?: string;
};

/** Response cursor field → the query param that echoes it back; currentPageToken is excluded, it names the page in hand. */
const CURSOR_PARAMS = [
  { field: 'nextBatchId', param: 'nextBatchId' },
  { field: 'nextPageToken', param: 'pageToken' },
  { field: 'continuationToken', param: 'continuationToken' },
] as const;

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
 *
 * An explicit `arrayKey` is a STRICT selector: if it is absent the result is
 * empty, never a sibling array. The fields response nests `fields` alongside
 * `primaryKeys`, so falling through would render one collection as the other.
 */
export const extractArray = <T>(response: unknown, arrayKey?: string): T[] => {
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
      return Array.isArray(current) ? (current as T[]) : [];
    }
    if (Array.isArray(obj.data)) return obj.data as T[];
    // Some endpoints return the array at a domain-specific key
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Cursors sit beside the array, which a dotted arrayKey (collection.items) nests one level down. */
const cursorSource = (response: Record<string, unknown>, arrayKey?: string): Record<string, unknown> => {
  const parentKey = arrayKey?.includes('.') ? arrayKey.split('.').slice(0, -1).join('.') : undefined;
  const parent = parentKey ? response[parentKey] : undefined;
  return isRecord(parent) ? { ...parent, ...response } : response;
};

/** Parse raw API response into a PaginatedResponse. */
const toPage = <T>(response: Record<string, unknown>, arrayKey?: string): PaginatedResponse<T> => {
  const src = cursorSource(response, arrayKey);
  const str = (key: string): string | undefined => (typeof src[key] === 'string' ? (src[key] as string) : undefined);
  return {
    data: extractArray<T>(response, arrayKey),
    totalSize: typeof src.totalSize === 'number' ? src.totalSize : undefined,
    nextBatchId: str('nextBatchId'),
    nextPageUrl: str('nextPageUrl'),
    nextPageToken: str('nextPageToken'),
    continuationToken: str('continuationToken'),
  };
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
  return toPage<T>(response, arrayKey);
};

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
  // Style 2: echo whichever opaque cursor the response named back as its own query param
  for (const { field, param } of CURSOR_PARAMS) {
    const cursor = page[field];
    if (!cursor) continue;
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${endpoint}${sep}batchSize=${batchSize}&${param}=${encodeURIComponent(cursor)}`;
    // eslint-disable-next-line no-await-in-loop
    const response = await ssotGet<Record<string, unknown>>(org, apiVersion, url, requestOptions);
    return toPage<T>(response, arrayKey);
  }
  return null;
};

/** The cursor fetchNextPage would follow, in its own precedence order, or undefined if the chain has ended. */
const nextCursor = <T>(page: PaginatedResponse<T>): string | undefined => {
  if (page.nextPageUrl) return page.nextPageUrl;
  for (const { field } of CURSOR_PARAMS) {
    if (page[field]) return page[field];
  }
  return undefined;
};

/**
 * Fetch all pages from an endpoint, handling three pagination styles:
 * 1. nextPageUrl (data-streams, etc.) — follow the URL directly
 * 2. cursor-based — nextBatchId, nextPageToken (as pageToken), continuationToken
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
  const seenCursors = new Set<string>();
  let followedChain = false;

  // First page
  let page = await fetchPage<T>(org, apiVersion, endpoint, 0, batchSize, requestOptions, arrayKey);
  all.push(...page.data);

  // Follow pages
  while (all.length < maxRecords) {
    // A repeated cursor is a protocol violation: following it again re-requests the page in hand, forever.
    const cursor = nextCursor(page);
    if (cursor) {
      if (seenCursors.has(cursor)) break;
      seenCursors.add(cursor);
    }

    // Try nextPageUrl or a cursor token
    // eslint-disable-next-line no-await-in-loop
    const next = await fetchNextPage<T>(org, apiVersion, page, endpoint, batchSize, requestOptions, arrayKey);
    if (next) {
      followedChain = true;
      if (next.data.length === 0) break;
      all.push(...next.data);
      page = next;
      continue;
    }

    // A finished cursor/URL chain is done — offset paging is a different protocol, and an exactly-full
    // final page would otherwise restart the chain on an endpoint that ignores offset.
    if (followedChain) break;

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
