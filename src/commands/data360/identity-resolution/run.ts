import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';
import { MutationResult } from '../../../shared/data360/crudBase.js';

export default class Data360IdentityResolutionRun extends Data360Command<MutationResult> {
  public static readonly summary = 'Run a Data 360 identity resolution ruleset.';
  public static readonly examples = ['$ sf data360 identity-resolution run --target-org myorg --name Main'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Identity resolution ruleset name, label, or ID.',
      required: true,
    }),
  };

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = allFlags.name as string;

    // Resolve name/label to ID via the list endpoint
    const id = await resolveNameToId(this.org, this.apiVersion, name, {
      listEndpoint: '/identity-resolutions',
      nameFields: ['label', 'name', 'developerName', 'rulesetId'],
      idField: 'id',
    });

    const path = injectResourceId('/identity-resolutions/:identityResolution/actions/run-now', id);

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

    this.log('Identity resolution job started.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id, data: response };
  }
}
