import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { extractVectorMatches, QueryResponse } from '../../../shared/data360/queryResult.js';
import { buildVectorSearchSql } from '../../../shared/data360/sql.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';

export type Data360QueryVectorResult = {
  index: string;
  query: string;
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

export default class Data360QueryVector extends Data360Command<Data360QueryVectorResult> {
  public static readonly summary = 'Run vector search on a Data 360 search index.';
  public static readonly description = 'Executes a semantic vector search query against a specified search index.';
  public static readonly examples = [
    '$ sf data360 query vector --target-org myorg --index Knowledge_DMO --query "confirmation of class" --limit 5',
  ];
  public static readonly enableJsonFlag = true;
  public static readonly aliases = ['data360 search vector'];
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
    limit: Flags.integer({
      char: 'n',
      summary: 'Maximum number of matches to return.',
      default: 5,
      min: 1,
    }),
  };

  public async run(): Promise<Data360QueryVectorResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryVector);

    const built = buildVectorSearchSql(flags.index, flags.query, flags.limit);

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
      limit: flags.limit,
      sql: built.sql,
      matches,
    };
  }
}
