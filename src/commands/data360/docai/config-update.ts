import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DocaiConfigUpdate extends CrudUpdateCommand {
  public static readonly summary = 'Config update Data 360 docai.';
  public static readonly examples = ['$ sf data360 docai config-update --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/document-processing/configurations/:idOrApiName';
}
