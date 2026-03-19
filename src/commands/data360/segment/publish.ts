import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotPost, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { resolveNameToId } from '../../../shared/data360/nameResolver.js';
import { MutationResult } from '../../../shared/data360/crudBase.js';

export default class Data360SegmentPublish extends Data360Command<MutationResult> {
  public static readonly summary = 'Publish a Data 360 segment.';
  public static readonly examples = ['$ sf data360 segment publish --target-org myorg --name My_Segment'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Segment developer name, display name, or ID.',
      required: true,
    }),
  };

  public async run(): Promise<MutationResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = allFlags.name as string;

    // Resolve name to segment ID via the list endpoint
    const id = await resolveNameToId(this.org, this.apiVersion, name, {
      listEndpoint: '/segments',
      nameFields: ['apiName', 'displayName', 'name', 'developerName'],
      idField: 'marketSegmentId',
      arrayKey: 'segments',
    });

    const path = injectResourceId('/segments/:segmentId/actions/publish', id);

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

    this.log('Segment publish started.');
    this.emitTiming(apiMs, ssotTiming);

    return { success: true, id, data: response };
  }
}
