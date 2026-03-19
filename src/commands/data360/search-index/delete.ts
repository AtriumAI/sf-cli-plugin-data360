import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotDelete, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';
import { MutationResult } from '../../../shared/data360/crudBase.js';

export default class Data360SearchIndexDelete extends Data360Command<MutationResult> {
  public static readonly summary = 'Delete a Data 360 search index by name or ID.';
  public static readonly examples = ['$ sf data360 search-index delete --target-org myorg --name My_kav'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Search index developer name or ID.',
      required: true,
    }),
  };

  public async run(): Promise<MutationResult> {
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
    await ssotDelete<unknown>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    this.log('Deleted successfully.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id };
  }
}
