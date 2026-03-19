import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { getColumnNames, QueryResponse, toDisplayRows } from '../../../shared/data360/queryResult.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';

export type Data360QueryAsyncRowsResult = {
  queryId: string;
  rowCount: number;
  metadata: unknown;
  data: unknown[];
};

export default class Data360QueryAsyncRows extends Data360Command<Data360QueryAsyncRowsResult> {
  public static readonly summary = 'Fetch results from a completed async Data 360 query.';
  public static readonly description =
    'Retrieves the row data for a completed async query job. ' +
    'The query must be in COMPLETED status — check with "query async-status" first.';
  public static readonly examples = ['$ sf data360 query async-rows --target-org myorg --query-id abc123'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    'query-id': Flags.string({
      char: 'i',
      summary: 'Async query job ID.',
      required: true,
    }),
  };

  public async run(): Promise<Data360QueryAsyncRowsResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryAsyncRows);

    const path = injectResourceId('/query-sql/:queryId/rows', flags['query-id']);

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotGet<QueryResponse>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });

    const data = Array.isArray(response.data) ? response.data : [];
    const metadata = response.metadata ?? {};

    const columns = getColumnNames(metadata, data[0]);

    if (data.length === 0) {
      this.log('No results.');
    } else if (columns.length > 0) {
      const rows = toDisplayRows(data, columns, 140);
      this.table({
        data: rows,
        columns: columns.map((name) => ({ key: name, name })),
      });
    }

    this.log(`\nRows: ${data.length}`);
    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { queryId: flags['query-id'], rowCount: data.length, metadata, data };
  }
}
