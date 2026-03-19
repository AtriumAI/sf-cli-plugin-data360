import { performance } from 'node:perf_hooks';
import { SfError, Org } from '@salesforce/core';
import { buildSsotPath } from './apiVersion.js';

const toApiError = (error: unknown, method: string, path: string): SfError => {
  const details = error instanceof Error ? error.message : String(error);
  return new SfError(`Data 360 API ${method} ${path} failed: ${details}`, 'DATA360_API_ERROR');
};

export type SsotTiming = {
  getConnectionMs: number;
  buildPathMs: number;
  requestMs: number;
  totalMs: number;
};

export type SsotRequestOptions = {
  onTiming?: (timing: SsotTiming) => void;
};

const emitTiming = (options: SsotRequestOptions | undefined, timing: SsotTiming): void => {
  options?.onTiming?.(timing);
};

export const ssotGet = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  options?: SsotRequestOptions
): Promise<T> => {
  const t0 = performance.now();
  const conn = org.getConnection(apiVersion);
  const t1 = performance.now();
  const path = buildSsotPath(apiVersion, endpoint);
  const t2 = performance.now();

  try {
    const response = await conn.requestGet<T>(path);
    const t3 = performance.now();
    emitTiming(options, {
      getConnectionMs: Math.round(t1 - t0),
      buildPathMs: Math.round(t2 - t1),
      requestMs: Math.round(t3 - t2),
      totalMs: Math.round(t3 - t0),
    });
    return response;
  } catch (error) {
    const t3 = performance.now();
    emitTiming(options, {
      getConnectionMs: Math.round(t1 - t0),
      buildPathMs: Math.round(t2 - t1),
      requestMs: Math.round(t3 - t2),
      totalMs: Math.round(t3 - t0),
    });
    throw toApiError(error, 'GET', path);
  }
};

export const ssotPost = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  body: Record<string, unknown>,
  options?: SsotRequestOptions
): Promise<T> => {
  const t0 = performance.now();
  const conn = org.getConnection(apiVersion);
  const t1 = performance.now();
  const path = buildSsotPath(apiVersion, endpoint);
  const t2 = performance.now();

  try {
    const response = await conn.requestPost<T>(path, body);
    const t3 = performance.now();
    emitTiming(options, {
      getConnectionMs: Math.round(t1 - t0),
      buildPathMs: Math.round(t2 - t1),
      requestMs: Math.round(t3 - t2),
      totalMs: Math.round(t3 - t0),
    });
    return response;
  } catch (error) {
    const t3 = performance.now();
    emitTiming(options, {
      getConnectionMs: Math.round(t1 - t0),
      buildPathMs: Math.round(t2 - t1),
      requestMs: Math.round(t3 - t2),
      totalMs: Math.round(t3 - t0),
    });
    throw toApiError(error, 'POST', path);
  }
};

const ssotMutate = async <T>(
  method: 'PUT' | 'PATCH' | 'DELETE',
  org: Org,
  apiVersion: string,
  endpoint: string,
  body?: Record<string, unknown>,
  options?: SsotRequestOptions
): Promise<T> => {
  const t0 = performance.now();
  const conn = org.getConnection(apiVersion);
  const t1 = performance.now();
  const path = buildSsotPath(apiVersion, endpoint);
  const t2 = performance.now();

  try {
    const response = await conn.request<T>({
      method,
      url: path,
      body: body ? JSON.stringify(body) : undefined,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
    });
    const t3 = performance.now();
    emitTiming(options, {
      getConnectionMs: Math.round(t1 - t0),
      buildPathMs: Math.round(t2 - t1),
      requestMs: Math.round(t3 - t2),
      totalMs: Math.round(t3 - t0),
    });
    return response;
  } catch (error) {
    const t3 = performance.now();
    emitTiming(options, {
      getConnectionMs: Math.round(t1 - t0),
      buildPathMs: Math.round(t2 - t1),
      requestMs: Math.round(t3 - t2),
      totalMs: Math.round(t3 - t0),
    });
    throw toApiError(error, method, path);
  }
};

export const ssotPut = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  body: Record<string, unknown>,
  options?: SsotRequestOptions
): Promise<T> => ssotMutate<T>('PUT', org, apiVersion, endpoint, body, options);

export const ssotPatch = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  body: Record<string, unknown>,
  options?: SsotRequestOptions
): Promise<T> => ssotMutate<T>('PATCH', org, apiVersion, endpoint, body, options);

export const ssotDelete = async <T>(
  org: Org,
  apiVersion: string,
  endpoint: string,
  options?: SsotRequestOptions
): Promise<T> => ssotMutate<T>('DELETE', org, apiVersion, endpoint, undefined, options);
