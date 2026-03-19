import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { normalizeMetadataColumns, QueryResponse } from '../../../shared/data360/queryResult.js';
import { quoteIdentifier } from '../../../shared/data360/sql.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QueryDescribeResult = {
  table: string;
  count: number;
  columns: Array<{
    name: string;
    type: string;
    placeInOrder: number;
  }>;
  metadata: unknown;
};

export default class Data360QueryDescribe extends Data360Command<Data360QueryDescribeResult> {
  public static readonly summary = 'Describe Data 360 table columns.';
  public static readonly description = 'Shows the column schema of a DMO or DLO table by executing a LIMIT 0 query.';
  public static readonly examples = ['$ sf data360 query describe --target-org myorg --table MyDMO__dlm'];
  public static readonly enableJsonFlag = true;
  public static readonly aliases = ['data360 describe table'];
  public static readonly deprecateAliases = true;

  public static readonly flags = {
    ...data360Flags,
    table: Flags.string({
      char: 't',
      summary: 'DMO or DLO table name to describe.',
      required: true,
    }),
  };

  public async run(): Promise<Data360QueryDescribeResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryDescribe);

    const sql = `SELECT * FROM ${quoteIdentifier(flags.table)} LIMIT 0`;

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotPost<QueryResponse>(
      this.org,
      this.apiVersion,
      '/query',
      { sql },
      {
        onTiming: (t) => {
          ssotTiming = t;
        },
      }
    );
    const metadata = response.metadata ?? {};
    const columns = normalizeMetadataColumns(metadata);

    this.table({
      data: columns,
      columns: [
        { key: 'placeInOrder', name: '#' },
        { key: 'name', name: 'Column' },
        { key: 'type', name: 'Type' },
      ],
    });

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return {
      table: flags.table,
      count: columns.length,
      columns,
      metadata,
    };
  }
}
