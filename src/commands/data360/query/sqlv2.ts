import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { getColumnNames, QueryResponse, toDisplayRows } from '../../../shared/data360/queryResult.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QuerySqlV2Result = {
  rowCount: number;
  metadata: unknown;
  data: unknown[];
  nextBatchId?: string;
};

export default class Data360QuerySqlv2 extends Data360Command<Data360QuerySqlV2Result> {
  public static readonly summary = 'Execute Data 360 SQL via v2 query endpoint with pagination.';
  public static readonly description =
    'Executes a SQL statement against the v2 /queryv2 endpoint. ' +
    'Supports large result sets via pagination — if there are more rows, ' +
    'the response includes a nextBatchId. Use "query v2-batch --batch-id <id>" to fetch more.';
  public static readonly examples = [
    '$ sf data360 query sqlv2 --target-org myorg --sql \'SELECT * FROM "ssot__Individual__dlm"\'',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    sql: Flags.string({
      char: 'q',
      summary: 'SQL statement to execute.',
      required: true,
    }),
  };

  public async run(): Promise<Data360QuerySqlV2Result> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QuerySqlv2);

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotPost<QueryResponse>(
      this.org,
      this.apiVersion,
      '/queryv2',
      { sql: flags.sql },
      {
        onTiming: (t) => {
          ssotTiming = t;
        },
      }
    );

    const data = Array.isArray(response.data) ? response.data : [];
    const metadata = response.metadata ?? {};
    const nextBatchId = typeof response.nextBatchId === 'string' ? response.nextBatchId : undefined;

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
    if (nextBatchId) {
      this.log('More results available. Fetch next batch:');
      this.log(`  sf data360 query v2-batch --batch-id ${nextBatchId}`);
    }

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { rowCount: data.length, metadata, data, nextBatchId };
  }
}
