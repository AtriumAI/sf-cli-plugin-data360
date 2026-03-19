import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';
import { GetResult } from '../../../shared/data360/crudBase.js';

type ConnectionDetail = {
  id: string;
  name: string;
  connectorType: string;
  status: string;
  label: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360ConnectionGet extends Data360Command<GetResult<ConnectionDetail>> {
  public static readonly summary = 'Get a Data 360 connection by name or ID.';
  public static readonly examples = ['$ sf data360 connection get --target-org myorg --name SalesforceDotCom_Home'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Connection name or ID.',
      required: true,
    }),
    'connector-type': Flags.string({
      char: 'c',
      summary: 'Connector type (e.g., SalesforceDotCom). Required for name resolution.',
      default: 'SalesforceDotCom',
    }),
  };

  public async run(): Promise<GetResult<ConnectionDetail>> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = allFlags.name as string;
    const connectorType = allFlags['connector-type'] as string;

    // Resolve connection name to ID via the list endpoint (requires connectorType)
    const id = await resolveNameToId(this.org, this.apiVersion, name, {
      listEndpoint: `/connections?connectorType=${encodeURIComponent(connectorType)}`,
      nameFields: ['name', 'label', 'developerName'],
      idField: 'id',
    });

    const path = injectResourceId('/connections/:connectionId', id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const data: ConnectionDetail = {
      id: str(response.id),
      name: str(response.name),
      connectorType: str(response.connectorType),
      status: str(response.status),
      label: str(response.label),
    };

    this.table({
      data: [data],
      columns: [
        { key: 'id', name: 'ID' },
        { key: 'name', name: 'Name' },
        { key: 'connectorType', name: 'Connector Type' },
        { key: 'status', name: 'Status' },
        { key: 'label', name: 'Label' },
      ],
    });

    this.emitTiming(apiMs, ssotTiming);
    return { data };
  }
}
