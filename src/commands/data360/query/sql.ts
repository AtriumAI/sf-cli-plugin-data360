import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { getColumnNames, QueryResponse, toDisplayRows } from '../../../shared/data360/queryResult.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QuerySqlResult = {
  rowCount: number;
  metadata: unknown;
  data: unknown[];
};

export default class Data360QuerySql extends Data360Command<Data360QuerySqlResult> {
  public static readonly summary = 'Execute Data 360 SQL.';
  public static readonly description = 'Executes an arbitrary SQL statement against the Data 360 query engine.';
  public static readonly examples = [
    '$ sf data360 query sql --target-org myorg --sql \'SELECT COUNT(*) FROM "MyDMO__dlm"\'',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    sql: Flags.string({
      char: 'q',
      summary: 'Data 360 SQL statement to execute.',
      required: true,
    }),
  };

  public async run(): Promise<Data360QuerySqlResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QuerySql);

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

    return {
      rowCount: data.length,
      metadata,
      data,
    };
  }
}
