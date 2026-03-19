import { Org, SfError } from '@salesforce/core';
import { ssotGet, SsotRequestOptions } from './ssotClient.js';

export type PollOptions = {
  /** Endpoint to GET for status checks. */
  statusEndpoint: string;
  /** Function to extract status string from response. */
  extractStatus: (response: Record<string, unknown>) => string;
  /** Status values that mean the job is done (success). */
  successStatuses: string[];
  /** Status values that mean the job failed. */
  failureStatuses: string[];
  /** Maximum time to wait in minutes (default: 5). */
  waitMinutes?: number;
  /** Polling interval in seconds (default: 5). */
  intervalSeconds?: number;
  /** Optional callback on each poll. */
  onPoll?: (status: string, elapsed: number) => void;
};

export type PollResult<T = Record<string, unknown>> = {
  status: string;
  response: T;
  elapsed: number;
  polls: number;
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Poll a status endpoint until a terminal state is reached or timeout.
 */
export const pollJob = async <T = Record<string, unknown>>(
  org: Org,
  apiVersion: string,
  options: PollOptions,
  requestOptions?: SsotRequestOptions
): Promise<PollResult<T>> => {
  const waitMs = (options.waitMinutes ?? 5) * 60 * 1000;
  const intervalMs = (options.intervalSeconds ?? 5) * 1000;
  const start = Date.now();
  let polls = 0;

  while (Date.now() - start < waitMs) {
    // eslint-disable-next-line no-await-in-loop
    const response = await ssotGet<Record<string, unknown>>(org, apiVersion, options.statusEndpoint, requestOptions);
    polls++;
    const status = options.extractStatus(response);
    const elapsed = Date.now() - start;

    options.onPoll?.(status, elapsed);

    if (options.successStatuses.includes(status)) {
      return { status, response: response as T, elapsed, polls };
    }

    if (options.failureStatuses.includes(status)) {
      throw new SfError(
        `Job failed with status "${status}" after ${Math.round(elapsed / 1000)}s`,
        'DATA360_JOB_FAILED'
      );
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(intervalMs);
  }

  throw new SfError(
    `Job did not complete within ${options.waitMinutes ?? 5} minutes (${polls} polls)`,
    'DATA360_JOB_TIMEOUT'
  );
};
