import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';

type HistoryEntry = {
  status: string;
  duration: string;
  startTime: string;
  endTime: string;
  definitionName: string;
};

type HistoryResult = {
  data: HistoryEntry[];
  totalSize: number;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360TransformHistory extends Data360Command<HistoryResult> {
  public static readonly summary = 'Show run history for a Data 360 data transform.';
  public static readonly examples = ['$ sf data360 transform history --target-org myorg --name MyTransform'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Transform name or ID.',
      required: true,
    }),
  };

  public async run(): Promise<HistoryResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360TransformHistory);

    const path = injectResourceId('/data-transforms/:id/run-history', flags.name);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const histories = Array.isArray(response.histories) ? response.histories : [];
    const data = histories.map((h: Record<string, unknown>) => ({
      status: str(h.status),
      duration: typeof h.duration === 'number' ? `${h.duration}s` : str(h.duration),
      startTime: str(h.startTime),
      endTime: str(h.endTime),
      definitionName: str(h.definitionName),
    }));

    if (data.length === 0) {
      this.log('No run history.');
    } else {
      this.table({
        data,
        columns: [
          { key: 'status', name: 'Status' },
          { key: 'duration', name: 'Duration' },
          { key: 'startTime', name: 'Start Time' },
          { key: 'endTime', name: 'End Time' },
          { key: 'definitionName', name: 'Definition' },
        ],
      });
    }

    this.emitTiming(apiMs, ssotTiming);

    return { data, totalSize: data.length };
  }
}
