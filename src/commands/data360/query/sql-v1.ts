import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { getColumnNames, QueryResponse, toDisplayRows } from '../../../shared/data360/queryResult.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QuerySqlV1Result = {
  rowCount: number;
  metadata: unknown;
  data: unknown[];
};

export default class Data360QuerySqlV1 extends Data360Command<Data360QuerySqlV1Result> {
  public static readonly summary = 'Execute Data 360 SQL via v1 query endpoint.';
  public static readonly description =
    'Executes a SQL statement against the v1 /query endpoint. ' +
    'Equivalent to "query sql" — use "query sqlv2" for paginated results on large datasets.';
  public static readonly examples = [
    '$ sf data360 query sql-v1 --target-org myorg --sql \'SELECT * FROM "ssot__Individual__dlm" LIMIT 10\'',
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

  public async run(): Promise<Data360QuerySqlV1Result> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QuerySqlV1);

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotPost<QueryResponse>(
      this.org,
      this.apiVersion,
      '/query',
      { sql: flags.sql },
      {
        onTiming: (t) => {
          ssotTiming = t;
        },
      }
    );
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

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { rowCount: data.length, metadata, data };
  }
}
