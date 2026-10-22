import { performance } from 'node:perf_hooks';
import { Flags } from '@salesforce/sf-plugins-core';
import { CrudDeleteCommand, MutationResult } from '../../../shared/data360/crudBase.js';
import { data360Flags, dataspaceFlag } from '../../../shared/data360/Data360Command.js';
import { buildPath } from '../../../shared/data360/pathBuilder.js';
import { ssotDelete, SsotTiming } from '../../../shared/data360/ssotClient.js';

export default class Data360DmoMappingDeleteFields extends CrudDeleteCommand {
  public static readonly summary = 'Delete one field mapping from a DLO→DMO mapping.';
  public static readonly description =
    'DELETEs a single field pair, leaving the object-level mapping and its other pairs in place. ' +
    '--name is the OBJECT-level mapping developer name and --field-mapping the field-level one ' +
    '(<sourceField>_fieldmap_<targetField>); mapping-list returns both.';
  public static readonly examples = [
    '$ sf data360 dmo mapping-delete-fields --target-org myorg --name Orders_map_Order_1712345678901 --field-mapping Quantity_c__c_fieldmap_Quantity__c',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    ...dataspaceFlag,
    name: Flags.string({
      char: 'n',
      summary: 'Developer name of the object-level mapping (ObjectSourceTargetMap).',
      required: true,
    }),
    'field-mapping': Flags.string({
      summary: 'Developer name of the field mapping to delete (FieldSourceTargetMap).',
      required: true,
    }),
  };

  protected readonly endpoint =
    '/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings/:fieldSourceTargetMapDeveloperName';

  public async run(): Promise<MutationResult> {
    const flags = (await this.parseData360Flags()) as unknown as Record<string, unknown>;
    const fieldMapping = (flags['field-mapping'] ?? '') as string;
    const path = buildPath(
      this.endpoint,
      {
        objectSourceTargetMapDeveloperName: (flags.name ?? '') as string,
        fieldSourceTargetMapDeveloperName: fieldMapping,
      },
      { dataspace: flags.dataspace as string }
    );

    let ssotTiming: SsotTiming | undefined;
    const tApi = performance.now();
    await ssotDelete<unknown>(this.org, this.apiVersion, path, {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    this.log('Deleted successfully.');
    this.emitTiming(performance.now() - tApi, ssotTiming);
    return { success: true, id: fieldMapping };
  }
}
