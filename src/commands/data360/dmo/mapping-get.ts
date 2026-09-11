import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags, dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360DmoMappingGet extends CrudActionCommand {
  public static readonly summary = 'Mapping get Data 360 dmo.';
  public static readonly examples = ['$ sf data360 dmo mapping-get --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    ...dataspaceFlag,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-model-object-mappings/:objectSourceTargetMapDeveloperName';

  protected readonly httpMethod = 'GET' as const;

  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { ...super.queryParams(flags), dataspace: flags.dataspace as string };
  }
}
