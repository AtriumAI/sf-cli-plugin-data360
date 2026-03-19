import { Flags } from '@salesforce/sf-plugins-core';
import { CrudDeleteCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DmoRelationshipDelete extends CrudDeleteCommand {
  public static readonly summary = 'Relationship delete Data 360 dmo.';
  public static readonly examples = ['$ sf data360 dmo relationship-delete --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-model-objects/relationships/:name';
}
