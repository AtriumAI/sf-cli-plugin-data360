import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360TransformUpdate extends CrudUpdateCommand {
  public static readonly summary = 'Update Data 360 transform.';
  public static readonly examples = ['$ sf data360 transform update --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-transforms/:dataTransformNameOrId';

  protected readonly updateMethod = 'PUT' as const;
}
