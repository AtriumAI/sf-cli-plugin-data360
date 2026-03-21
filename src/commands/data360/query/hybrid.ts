import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { extractVectorMatches, QueryResponse } from '../../../shared/data360/queryResult.js';
import { buildHybridSearchSql } from '../../../shared/data360/sql.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QueryHybridResult = {
  index: string;
  query: string;
  prefilter: string;
  limit: number;
  sql: string;
  matches: Array<{
    chunk: string;
    score: number | null;
    sourceRecordId: string;
  }>;
};

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

export default class Data360QueryHybrid extends Data360Command<Data360QueryHybridResult> {
  public static readonly summary = 'Run hybrid search (vector + keyword) on a Data Cloud search index.';
  public static readonly description =
    'Executes a hybrid search query that combines semantic vector similarity with keyword matching against a specified search index. Use --prefilter to narrow results by field values before ranking.';
  public static readonly examples = [
    '$ sf data360 query hybrid --target-org myorg --index Knowledge_DMO --query "confirmation of class" --limit 5',
    '$ sf data360 query hybrid --target-org myorg --index Insurance_index__dlm --query "weather damage coverage" --prefilter "Type_of_Insurance__c=\'Home\'" --limit 10',
  ];
  public static readonly enableJsonFlag = true;
  public static readonly aliases = ['data360 search hybrid'];
  public static readonly deprecateAliases = true;

  public static readonly flags = {
    ...data360Flags,
    index: Flags.string({
      char: 'i',
      summary: 'Search index base name or full *_index__dlm name.',
      required: true,
    }),
    query: Flags.string({
      char: 'q',
      summary: 'Natural language query text.',
      required: true,
    }),
    prefilter: Flags.string({
      char: 'p',
      summary: 'Pre-filter expression to narrow results before ranking (e.g. "Type__c=\'Home\'").',
      default: '',
    }),
    limit: Flags.integer({
      char: 'n',
      summary: 'Maximum number of matches to return.',
      default: 5,
      min: 1,
    }),
  };

  public async run(): Promise<Data360QueryHybridResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryHybrid);

    const built = buildHybridSearchSql(flags.index, flags.query, flags.prefilter, flags.limit);

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotPost<QueryResponse>(
      this.org,
      this.apiVersion,
      '/query',
      { sql: built.sql },
      {
        onTiming: (t) => {
          ssotTiming = t;
        },
      }
    );

    const rows = Array.isArray(response.data) ? response.data : [];
    const matches = extractVectorMatches(rows);

    this.table({
      data: matches.map((m) => ({
        score: m.score ?? '',
        sourceRecordId: m.sourceRecordId,
        chunk: truncate(m.chunk, 180),
      })),
      columns: [
        { key: 'score', name: 'Score' },
        { key: 'sourceRecordId', name: 'SourceRecordId' },
        { key: 'chunk', name: 'Chunk' },
      ],
    });

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return {
      index: built.indexTable,
      query: flags.query,
      prefilter: flags.prefilter,
      limit: flags.limit,
      sql: built.sql,
      matches,
    };
  }
}
