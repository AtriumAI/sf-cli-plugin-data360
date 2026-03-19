import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360TransformValidate extends CrudActionCommand {
  public static readonly summary = 'Validate a Data 360 data transform.';
  public static readonly examples = ['$ sf data360 transform validate --target-org myorg --name MyTransform'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Transform name or ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-transforms/:dataTransformNameOrId/actions/validate';
}
