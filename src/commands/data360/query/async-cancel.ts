import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotDelete, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { MutationResult } from '../../../shared/data360/crudBase.js';

export default class Data360QueryAsyncCancel extends Data360Command<MutationResult> {
  public static readonly summary = 'Cancel an async Data 360 query job.';
  public static readonly examples = ['$ sf data360 query async-cancel --target-org myorg --query-id abc123'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    'query-id': Flags.string({
      char: 'i',
      summary: 'Async query job ID to cancel.',
      required: true,
    }),
  };

  public async run(): Promise<MutationResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360QueryAsyncCancel);

    const path = injectResourceId('/query-sql/:queryId', flags['query-id']);

    let ssotTiming: SsotTiming | undefined;
    await ssotDelete<unknown>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });

    this.log(`Async query ${flags['query-id']} cancelled.`);
    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { success: true, id: flags['query-id'] };
  }
}
