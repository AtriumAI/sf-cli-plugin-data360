import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { injectResourceId } from '../../../shared/data360/pathBuilder.js';

type SchemaRecord = {
  name: string;
  label: string;
  status: string;
  fieldCount: number;
};

type SchemaGetResult = {
  data: SchemaRecord[];
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360ConnectionSchemaGet extends Data360Command<SchemaGetResult> {
  public static readonly summary = 'Get schema for a Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection schema-get --target-org myorg --name <connection-id>'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Connection name or ID.',
      required: true,
    }),
  };

  public async run(): Promise<SchemaGetResult> {
    const flags = await this.parseData360Flags();
    const allFlags = flags as unknown as Record<string, unknown>;
    const name = allFlags.name as string;

    const path = injectResourceId('/connections/:connectionId/schema', name);

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const apiMs = performance.now() - tApi;

    const schemas = Array.isArray(response.schemas) ? (response.schemas as Array<Record<string, unknown>>) : [];

    const data: SchemaRecord[] = schemas.map((s) => ({
      name: str(s.name),
      label: str(s.label),
      status: str(s.availabilityStatus),
      fieldCount: Array.isArray(s.fields) ? s.fields.length : 0,
    }));

    if (data.length === 0) {
      this.log('No schemas found.');
    } else {
      this.table({
        data,
        columns: [
          { key: 'name', name: 'Schema' },
          { key: 'label', name: 'Label' },
          { key: 'status', name: 'Status' },
          { key: 'fieldCount', name: 'Fields' },
        ],
      });
    }

    this.emitTiming(apiMs, ssotTiming);
    return { data };
  }
}
