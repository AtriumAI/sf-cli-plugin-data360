/**
 * Mock Org factory for testing Data 360 commands without real API calls.
 *
 * All commands funnel through org.getConnection().requestGet/requestPost/request.
 * This mock intercepts at that level, logging every request for assertions.
 */
import { Org } from '@salesforce/core';

export type RequestLog = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
};

export type MockOrgOptions = {
  /** Map of URL prefix → response. URL is matched by prefix (before query params). */
  responses?: Map<string, unknown>;
  /** Fallback response when no URL match is found. */
  defaultResponse?: unknown;
};

export type MockOrgResult = {
  org: Org;
  requestLog: RequestLog[];
  getLastRequest(): RequestLog | undefined;
};

const matchResponse = (url: string, responses: Map<string, unknown>, defaultResponse: unknown): unknown => {
  // Try exact match first
  if (responses.has(url)) return responses.get(url);

  // Try prefix match (strip query params)
  const basePath = url.split('?')[0];
  if (responses.has(basePath)) return responses.get(basePath);

  // Try partial path match — prefer longest matching pattern
  let bestMatch: { pattern: string; response: unknown } | undefined;
  for (const [pattern, response] of responses) {
    if (url.includes(pattern) || basePath.includes(pattern)) {
      if (!bestMatch || pattern.length > bestMatch.pattern.length) {
        bestMatch = { pattern, response };
      }
    }
  }
  if (bestMatch) return bestMatch.response;

  return defaultResponse;
};

export const createMockOrg = (options?: MockOrgOptions): MockOrgResult => {
  const responses = options?.responses ?? new Map<string, unknown>();
  const defaultResponse = options?.defaultResponse ?? {};
  const requestLog: RequestLog[] = [];

  const mockConnection = {
    requestGet: async (url: string) => {
      requestLog.push({ method: 'GET', url });
      return matchResponse(url, responses, defaultResponse);
    },
    requestPost: async (url: string, body: unknown) => {
      requestLog.push({ method: 'POST', url, body });
      return matchResponse(url, responses, defaultResponse);
    },
    request: async (opts: { method: string; url: string; body?: string }) => {
      const method = opts.method as RequestLog['method'];
      const body = opts.body ? JSON.parse(opts.body) : undefined;
      requestLog.push({ method, url: opts.url, body });
      return matchResponse(opts.url, responses, defaultResponse);
    },
  };

  const org = {
    getConnection: () => mockConnection,
  } as unknown as Org;

  return {
    org,
    requestLog,
    getLastRequest: () => requestLog[requestLog.length - 1],
  };
};
