import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotGet, SsotTiming } from '../../../shared/data360/ssotClient.js';
import { buildPath } from '../../../shared/data360/pathBuilder.js';

type FieldMappingRecord = {
  sourceField: string;
  targetField: string;
  developerName: string;
};

type MappingListResult = {
  source: string;
  target: string;
  developerName: string;
  status: string;
  fieldCount: number;
  fields: FieldMappingRecord[];
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DmoMappingList extends Data360Command<MappingListResult> {
  public static readonly summary = 'List field mappings between a DLO and DMO.';
  public static readonly examples = [
    '$ sf data360 dmo mapping-list --target-org myorg --source Contact_Home__dll --target ssot__Individual__dlm',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    source: Flags.string({
      char: 's',
      summary: 'Source DLO developer name (e.g. Contact_Home__dll).',
      required: true,
    }),
    target: Flags.string({
      char: 't',
      summary: 'Target DMO developer name (e.g. ssot__Individual__dlm).',
      required: true,
    }),
    'api-version': Flags.string({
      summary: 'API version to use for Data 360 requests.',
      // This endpoint errors on v66; v64 is stable per demo-builder
      default: '64.0',
    }),
  };

  public async run(): Promise<MappingListResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360DmoMappingList);

    const path = buildPath('/data-model-object-mappings', undefined, {
      dloDeveloperName: flags.source,
      dmoDeveloperName: flags.target,
    });

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });

    // Response: { objectSourceTargetMaps: [{ sourceEntityDeveloperName, targetEntityDeveloperName, fieldMappings: [...], status }] }
    const maps = Array.isArray(response.objectSourceTargetMaps)
      ? (response.objectSourceTargetMaps as Array<Record<string, unknown>>)
      : [];

    if (maps.length === 0) {
      this.log(`No mapping found between ${flags.source} and ${flags.target}.`);
      return { source: flags.source, target: flags.target, developerName: '', status: '', fieldCount: 0, fields: [] };
    }

    const map = maps[0];
    // The ObjectSourceTargetMap developer name — mapping-update-field's --name.
    const developerName = str(map.developerName);
    const status = str(map.status);
    const fieldMappings = Array.isArray(map.fieldMappings) ? (map.fieldMappings as Array<Record<string, unknown>>) : [];

    const fields: FieldMappingRecord[] = fieldMappings.map((fm) => ({
      sourceField: str(fm.sourceFieldDeveloperName),
      targetField: str(fm.targetFieldDeveloperName),
      developerName: str(fm.developerName),
    }));

    this.styledHeader(`${flags.source} → ${flags.target} (${status})`);

    if (fields.length > 0) {
      this.table({
        data: fields,
        columns: [
          { key: 'sourceField', name: 'Source Field (DLO)' },
          { key: 'targetField', name: 'Target Field (DMO)' },
        ],
      });
    }

    this.log(`\n${fields.length} field mapping(s).`);
    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);

    return { source: flags.source, target: flags.target, developerName, status, fieldCount: fields.length, fields };
  }
}
