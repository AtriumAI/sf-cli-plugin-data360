import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';
import { GetResult } from '../../../shared/data360/crudBase.js';

type SearchIndexDetail = {
  name: string;
  status: string;
  searchType: string;
  sourceDmo: string;
  fieldCount: number;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360SearchIndexGet extends Data360Command<GetResult<SearchIndexDetail>> {
  public static readonly summary = 'Get a Data 360 search index by name or ID.';
  public static readonly examples = ['$ sf data360 search-index get --target-org myorg --name My_kav'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Search index developer name or ID.',
      required: true,
    }),
  };

  public async run(): Promise<GetResult<SearchIndexDetail>> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = allFlags.name as string;

    // Resolve developer name to ID via the list endpoint
    const id = await resolveNameToId(this.org, this.apiVersion, name, {
      listEndpoint: '/search-index',
      nameFields: ['developerName', 'name', 'apiName'],
      idField: 'id',
      arrayKey: 'semanticSearchDefinitionDetails',
    });

    const path = injectResourceId('/search-index/:searchIndexApiNameOrId', id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const fields = Array.isArray(response.fields) ? response.fields : [];
    const data: SearchIndexDetail = {
      name: str(response.developerName ?? response.name),
      status: str(response.runtimeStatus ?? response.status),
      searchType: str(response.searchType),
      sourceDmo: str(response.sourceDmoDeveloperName),
      fieldCount: fields.length,
    };

    this.table({
      data: [data],
      columns: [
        { key: 'name', name: 'Name' },
        { key: 'status', name: 'Status' },
        { key: 'searchType', name: 'Type' },
        { key: 'sourceDmo', name: 'Source DMO' },
        { key: 'fieldCount', name: 'Fields' },
      ],
    });

    this.emitTiming(apiMs, ssotTiming);
    return { data };
  }
}
