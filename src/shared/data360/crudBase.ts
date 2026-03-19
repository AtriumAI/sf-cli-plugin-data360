import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from './Data360Command.js';
import { buildPath, injectResourceId } from './pathBuilder.js';
import { fetchAllPages, fetchPage, PaginationOptions } from './pagination.js';
import { ssotGet, ssotPost, ssotPut, ssotPatch, ssotDelete, SsotTiming } from './ssotClient.js';
import { loadDefinitionFile } from './definitionFile.js';

// ─── Common types ───

type ColumnDef = { key: string; name: string };

export type ListResult<T> = {
  data: T[];
  totalSize: number;
};

export type GetResult<T> = {
  data: T;
};

export type MutationResult = {
  success: boolean;
  id?: string;
  data?: Record<string, unknown>;
};

// ─── Helpers ───

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const extractId = (response: unknown): string | undefined => {
  if (isRecord(response)) {
    for (const key of ['id', 'Id', 'ID', 'name', 'developerName']) {
      if (typeof response[key] === 'string') return response[key] as string;
    }
  }
  return undefined;
};

const getDefinitionBody = (flags: Record<string, unknown>): Record<string, unknown> =>
  (flags.definitionBody as Record<string, unknown>) ?? {};

// ─── Shared flag sets for subclasses to spread into their own static flags ───

export const listFlags = {
  ...data360Flags,
  all: Flags.boolean({
    summary: 'Fetch all pages of results.',
    default: false,
  }),
};

export const mutationFlags = {
  ...data360Flags,
  'definition-file': Flags.file({
    char: 'f',
    summary: 'Path to a JSON definition file. Use "-" for stdin.',
    exists: false,
  }),
};

// ─── CrudListCommand ───

/* eslint-disable @typescript-eslint/member-ordering */

export abstract class CrudListCommand<T extends Record<string, unknown>> extends Data360Command<ListResult<T>> {
  protected abstract readonly endpoint: string;
  protected abstract readonly columns: ColumnDef[];
  protected readonly arrayKey?: string;
  /** Override to match the API's actual page size (default: 200). */
  protected readonly batchSize?: number;

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected queryParams(_flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return {};
  }

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): T {
    return record as T;
  }

  public async run(): Promise<ListResult<T>> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const fetchAll = allFlags.all === true;

    const query = this.queryParams(allFlags);
    const id = (allFlags.name ?? allFlags.id ?? '') as string;
    const basePath = id ? injectResourceId(this.endpoint, id) : this.endpoint;
    const path = buildPath(basePath, undefined, query);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();

    const bs = this.batchSize ?? 200;
    let rawData: Array<Record<string, unknown>>;
    if (fetchAll) {
      const paginationOpts: PaginationOptions = { all: true, batchSize: bs };
      rawData = await fetchAllPages<Record<string, unknown>>(
        this.org,
        this.apiVersion,
        path,
        paginationOpts,
        {
          onTiming: (t) => {
            ssotTiming = t;
          },
        },
        this.arrayKey
      );
    } else {
      const page = await fetchPage<Record<string, unknown>>(
        this.org,
        this.apiVersion,
        path,
        0,
        bs,
        {
          onTiming: (t) => {
            ssotTiming = t;
          },
        },
        this.arrayKey
      );
      rawData = page.data;
    }
    const apiMs = performance.now() - tApi;

    const data = rawData.map((r) => this.mapRecord(r));

    if (data.length === 0) {
      this.log('No results.');
    } else {
      this.table({ data, columns: this.columns });
    }

    this.emitTiming(apiMs, ssotTiming);

    return { data, totalSize: data.length };
  }
}

// ─── CrudGetCommand ───

export abstract class CrudGetCommand<T extends Record<string, unknown>> extends Data360Command<GetResult<T>> {
  protected abstract readonly endpoint: string;
  protected abstract readonly columns: ColumnDef[];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): T {
    return record as T;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getResourceId(flags: Record<string, unknown>): string {
    return (flags.name ?? flags.id ?? '') as string;
  }

  public async run(): Promise<GetResult<T>> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const id = this.getResourceId(allFlags);

    const path = injectResourceId(this.endpoint, id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const data = this.mapRecord(isRecord(response) ? response : {});

    this.table({ data: [data], columns: this.columns });
    this.emitTiming(apiMs, ssotTiming);

    return { data };
  }
}

// ─── CrudCreateCommand ───

export abstract class CrudCreateCommand extends Data360Command<MutationResult> {
  protected abstract readonly endpoint: string;

  // eslint-disable-next-line class-methods-use-this
  protected buildBody(flags: Record<string, unknown>): Record<string, unknown> {
    return getDefinitionBody(flags);
  }

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;

    const defFile = allFlags['definition-file'] as string | undefined;
    if (defFile) {
      allFlags.definitionBody = await loadDefinitionFile(defFile);
    }

    const body = this.buildBody(allFlags);
    const resourceName = (allFlags.name ?? allFlags.id ?? '') as string;
    const path = resourceName ? injectResourceId(this.endpoint, resourceName) : buildPath(this.endpoint);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotPost<Record<string, unknown>>(this.org, this.apiVersion, path, body, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const id = extractId(response);
    this.log(`Created successfully.${id ? ` ID: ${id}` : ''}`);
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id, data: isRecord(response) ? response : undefined };
  }
}

// ─── CrudUpdateCommand ───

export abstract class CrudUpdateCommand extends Data360Command<MutationResult> {
  protected abstract readonly endpoint: string;
  protected readonly updateMethod: 'PUT' | 'PATCH' = 'PATCH';

  // eslint-disable-next-line class-methods-use-this
  protected buildBody(flags: Record<string, unknown>): Record<string, unknown> {
    return getDefinitionBody(flags);
  }

  // eslint-disable-next-line class-methods-use-this
  protected getResourceId(flags: Record<string, unknown>): string {
    return (flags.name ?? flags.id ?? '') as string;
  }

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const id = this.getResourceId(allFlags);

    const defFile = allFlags['definition-file'] as string | undefined;
    if (defFile) {
      allFlags.definitionBody = await loadDefinitionFile(defFile);
    }

    const body = this.buildBody(allFlags);
    const path = injectResourceId(this.endpoint, id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();

    const mutate = this.updateMethod === 'PUT' ? ssotPut : ssotPatch;
    const response = await mutate<Record<string, unknown>>(this.org, this.apiVersion, path, body, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    this.log('Updated successfully.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id, data: isRecord(response) ? response : undefined };
  }
}

// ─── CrudDeleteCommand ───

export abstract class CrudDeleteCommand extends Data360Command<MutationResult> {
  protected abstract readonly endpoint: string;

  // eslint-disable-next-line class-methods-use-this
  protected getResourceId(flags: Record<string, unknown>): string {
    return (flags.name ?? flags.id ?? '') as string;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected deleteQueryParams(_flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return {};
  }

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const id = this.getResourceId(allFlags);

    let path = injectResourceId(this.endpoint, id);
    const query = this.deleteQueryParams(allFlags);
    const queryStr = Object.entries(query)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (queryStr) {
      path += (path.includes('?') ? '&' : '?') + queryStr;
    }

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    await ssotDelete<unknown>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    this.log('Deleted successfully.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id };
  }
}

// ─── CrudActionCommand (for run, cancel, retry, etc.) ───

export abstract class CrudActionCommand extends Data360Command<MutationResult> {
  protected abstract readonly endpoint: string;
  protected readonly httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST';

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected buildBody(_flags: Record<string, unknown>): Record<string, unknown> | undefined {
    return undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getResourceId(flags: Record<string, unknown>): string {
    return (flags.name ?? flags.id ?? '') as string;
  }

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const id = this.getResourceId(allFlags);
    const body = this.buildBody(allFlags);

    const path = injectResourceId(this.endpoint, id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();

    const timingOpt = {
      onTiming: (t: SsotTiming): void => {
        ssotTiming = t;
      },
    };
    const response = await this.executeAction(path, body, timingOpt);
    const apiMs = performance.now() - tApi;

    this.log('Action completed successfully.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id, data: isRecord(response) ? response : undefined };
  }

  private async executeAction(
    path: string,
    body: Record<string, unknown> | undefined,
    timingOpt: { onTiming: (t: SsotTiming) => void }
  ): Promise<unknown> {
    switch (this.httpMethod) {
      case 'GET':
        return ssotGet<unknown>(this.org, this.apiVersion, path, timingOpt);
      case 'POST':
        return ssotPost<unknown>(this.org, this.apiVersion, path, body ?? {}, timingOpt);
      case 'PUT':
        return ssotPut<unknown>(this.org, this.apiVersion, path, body ?? {}, timingOpt);
      case 'PATCH':
        return ssotPatch<unknown>(this.org, this.apiVersion, path, body ?? {}, timingOpt);
      case 'DELETE':
        return ssotDelete<unknown>(this.org, this.apiVersion, path, timingOpt);
    }
  }
}
