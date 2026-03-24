import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';
import { MutationResult } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionTest extends Data360Command<MutationResult> {
  public static readonly summary = 'Test a Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection test --target-org myorg --name SalesforceDotCom_Home'];
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

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = allFlags.name as string;
    const connectorType = allFlags['connector-type'] as string;

    const id = await resolveNameToId(this.org, this.apiVersion, name, {
      listEndpoint: `/connections?connectorType=${encodeURIComponent(connectorType)}`,
      nameFields: ['name', 'label', 'developerName'],
      idField: 'id',
    });

    const path = injectResourceId('/connections/:connectionId/actions/test', id);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    await ssotPost<unknown>(
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

    this.log('Connection test passed.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id };
  }
}
