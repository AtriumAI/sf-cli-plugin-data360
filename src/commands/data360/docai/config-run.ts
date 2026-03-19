import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DocaiConfigRun extends CrudActionCommand {
  public static readonly summary = 'Config run Data 360 docai.';
  public static readonly examples = ['$ sf data360 docai config-run --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/document-processing/configurations/:idOrApiName/actions/run';
}
