import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';

export type Data360QueryAsyncStatusResult = {
  queryId: string;
  status: string;
  data: Record<string, unknown>;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export default class Data360QueryAsyncStatus extends Data360Command<Data360QueryAsyncStatusResult> {
  public static readonly summary = 'Check status of an async Data 360 query job.';
  public static readonly examples = ['$ sf data360 query async-status --target-org myorg --query-id abc123'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    'query-id': Flags.string({
      char: 'i',
      summary: 'Async query job ID.',
      required: true,
    }),
  };

  public async run(): Promise<Data360QueryAsyncStatusResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryAsyncStatus);

    const path = injectResourceId('/query-sql/:queryId', flags['query-id']);

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });

    const queryId = str(response.queryId ?? response.id ?? flags['query-id']);
    const status = str(response.status);

    this.table({
      data: [
        {
          queryId,
          status,
          createdDate: str(response.createdDate),
          completedDate: str(response.completedDate),
          rowCount: str(response.rowCount ?? response.totalRows ?? ''),
          errorMessage: str(response.errorMessage),
        },
      ],
      columns: [
        { key: 'queryId', name: 'Query ID' },
        { key: 'status', name: 'Status' },
        { key: 'createdDate', name: 'Created' },
        { key: 'completedDate', name: 'Completed' },
        { key: 'rowCount', name: 'Rows' },
        { key: 'errorMessage', name: 'Error' },
      ],
    });

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { queryId, status, data: isRecord(response) ? response : {} };
  }
}
