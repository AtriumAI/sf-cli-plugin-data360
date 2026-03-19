import { performance } from 'node:perf_hooks';
import { Org } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { DEFAULT_API_VERSION, normalizeApiVersion } from './apiVersion.js';
import { SsotTiming } from './ssotClient.js';

export type Data360Flags = {
  'target-org': Org;
  'api-version': string;
  timing: boolean;
};

export const data360Flags = {
  'target-org': Flags.requiredOrg(),
  'api-version': Flags.string({
    summary: 'API version to use for Data 360 requests.',
    default: DEFAULT_API_VERSION,
  }),
  timing: Flags.boolean({
    summary: 'Print command timing breakdown to stderr.',
    default: false,
  }),
};

export type CommandTiming = {
  parseMs: number;
  apiMs: number;
  apiDetail?: SsotTiming;
  totalMs: number;
};

export abstract class Data360Command<T> extends SfCommand<T> {
  public static readonly enableJsonFlag = true;

  protected tStart = 0;
  protected tParsed = 0;

  protected org!: Org;
  protected apiVersion!: string;
  protected showTiming = false;

  protected async parseData360Flags(): Promise<Data360Flags> {
    this.tStart = performance.now();
    const { flags } = await this.parse(this.constructor as typeof Data360Command);
    this.tParsed = performance.now();

    const typedFlags = flags as unknown as Data360Flags;
    this.org = typedFlags['target-org'];
    this.apiVersion = normalizeApiVersion(typedFlags['api-version']);
    this.showTiming = typedFlags.timing;

    return typedFlags;
  }

  protected emitTiming(apiMs: number, apiDetail?: SsotTiming): void {
    if (!this.showTiming) return;
    const now = performance.now();
    const timing: CommandTiming = {
      parseMs: Math.round(this.tParsed - this.tStart),
      apiMs: Math.round(apiMs),
      apiDetail,
      totalMs: Math.round(now - this.tStart),
    };
    const parts = [`parse=${timing.parseMs}ms`, `api=${timing.apiMs}ms`];
    if (apiDetail) {
      parts.push(`conn=${apiDetail.getConnectionMs}ms`, `req=${apiDetail.requestMs}ms`);
    }
    parts.push(`total=${timing.totalMs}ms`);
    this.logToStderr(`[timing] ${parts.join(' ')}`);
  }
}
