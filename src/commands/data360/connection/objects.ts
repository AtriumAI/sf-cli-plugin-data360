import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, listFlags, ListResult } from '../../../shared/data360/crudBase.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';

export default class Data360ConnectionObjects extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List objects for a Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection objects --target-org myorg --name SalesforceDotCom_Home'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Connection name or ID.',
      required: true,
    }),
    'connector-type': Flags.string({
      char: 'c',
      summary: 'Connector type (e.g., SalesforceDotCom).',
      default: 'SalesforceDotCom',
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/objects';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];

  // Override run() because this endpoint requires POST + name-to-ID resolution.
  public async run(): Promise<ListResult<Record<string, unknown>>> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = (allFlags.name ?? '') as string;
    const connectorType = (allFlags['connector-type'] ?? 'SalesforceDotCom') as string;

    const id = await resolveNameToId(this.org, this.apiVersion, name, {
      listEndpoint: `/connections?connectorType=${encodeURIComponent(connectorType)}`,
      nameFields: ['name', 'label', 'developerName'],
      idField: 'id',
    });
    const path = injectResourceId(this.endpoint, id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotPost<Record<string, unknown>>(
      this.org,
      this.apiVersion,
      path,
      {},
      {
        onTiming: (t) => {
          ssotTiming = t;
        },
      }
    );
    const apiMs = performance.now() - tApi;

    const data: Array<Record<string, unknown>> = Array.isArray(response)
      ? response
      : ((response.objects ?? response.data ?? []) as Array<Record<string, unknown>>);

    if (data.length === 0) {
      this.log('No results.');
    } else {
      this.table({ data, columns: this.columns });
    }

    this.emitTiming(apiMs, ssotTiming);

    return { data, totalSize: data.length };
  }
}
