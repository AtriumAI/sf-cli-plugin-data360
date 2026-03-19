import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QueryAsyncCreateResult = {
  queryId: string;
  status: string;
  data: Record<string, unknown>;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export default class Data360QueryAsyncCreate extends Data360Command<Data360QueryAsyncCreateResult> {
  public static readonly summary = 'Create an async Data 360 SQL query job.';
  public static readonly description =
    'Submits a SQL query for async execution. Returns a query ID that you can use with:\n' +
    '  - "query async-status --query-id <id>" to check progress\n' +
    '  - "query async-rows --query-id <id>" to fetch results\n' +
    '  - "query async-cancel --query-id <id>" to cancel\n' +
    'Use async queries for large result sets that would timeout with sync queries.';
  public static readonly examples = [
    '$ sf data360 query async-create --target-org myorg --sql \'SELECT * FROM "ssot__Individual__dlm"\'',
    '$ sf data360 query async-create --target-org myorg -f query.json',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    sql: Flags.string({
      char: 'q',
      summary: 'SQL statement to execute asynchronously.',
      exactlyOne: ['sql', 'definition-file'],
    }),
    'definition-file': Flags.file({
      char: 'f',
      summary: 'Path to a JSON file containing { "sql": "..." }.',
      exists: true,
      exactlyOne: ['sql', 'definition-file'],
    }),
  };

  public async run(): Promise<Data360QueryAsyncCreateResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryAsyncCreate);

    let body: Record<string, unknown>;
    if (flags.sql) {
      body = { sql: flags.sql };
    } else {
      const fs = await import('node:fs/promises');
      const raw = await fs.readFile(flags['definition-file']!, 'utf8');
      body = JSON.parse(raw) as Record<string, unknown>;
    }

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotPost<Record<string, unknown>>(this.org, this.apiVersion, '/query-sql', body, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });

    const queryId = String(isRecord(response) ? response.queryId ?? response.id ?? '' : '');
    const status = String(isRecord(response) ? response.status ?? 'SUBMITTED' : 'SUBMITTED');

    this.log(`Async query created. Query ID: ${queryId}`);
    this.log(`Status: ${status}`);
    this.log(`\nCheck progress:  sf data360 query async-status --query-id ${queryId}`);
    this.log(`Fetch results:   sf data360 query async-rows --query-id ${queryId}`);

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { queryId, status, data: isRecord(response) ? response : {} };
  }
}
