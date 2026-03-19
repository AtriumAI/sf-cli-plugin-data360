import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { getColumnNames, QueryResponse, toDisplayRows } from '../../../shared/data360/queryResult.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';

export type Data360QueryV2BatchResult = {
  rowCount: number;
  metadata: unknown;
  data: unknown[];
  nextBatchId?: string;
};

export default class Data360QueryV2Batch extends Data360Command<Data360QueryV2BatchResult> {
  public static readonly summary = 'Fetch next batch from a v2 query.';
  public static readonly description =
    'Retrieves the next page of results from a v2 query using the nextBatchId ' +
    'returned by "query sqlv2" or a previous "query v2-batch" call.';
  public static readonly examples = ['$ sf data360 query v2-batch --target-org myorg --batch-id abc123-def456'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    'batch-id': Flags.string({
      char: 'b',
      summary: 'The nextBatchId from a previous v2 query response.',
      required: true,
    }),
  };

  public async run(): Promise<Data360QueryV2BatchResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryV2Batch);

    const path = injectResourceId('/queryv2/:nextBatchId', flags['batch-id']);

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotGet<QueryResponse>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });

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
    } else {
      this.log('End of results.');
    }

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { rowCount: data.length, metadata, data, nextBatchId };
  }
}
