import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand, GetResult } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';
import { buildPath } from '../../../shared/data360/pathBuilder.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export default class Data360DataSpaceMemberGet extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Get a member of a Data 360 data space.';
  public static readonly examples = [
    '$ sf data360 data-space member-get --target-org myorg --name default --member Account',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the data space.',
      required: true,
    }),
    member: Flags.string({
      char: 'm',
      summary: 'Member object name.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-spaces/:idOrName/members/:dataSpaceMemberObjectName';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];

  public async run(): Promise<GetResult<Record<string, unknown>>> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;

    const name = (allFlags.name ?? '') as string;
    const member = (allFlags.member ?? '') as string;
    const path = buildPath(this.endpoint, { idOrName: name, dataSpaceMemberObjectName: member });

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const data = this.mapRecord(isRecord(response) ? response : {});

    this.table({ data: [data], columns: this.columns });
    this.emitTiming(apiMs, ssotTiming);

    return { data };
  }
}
