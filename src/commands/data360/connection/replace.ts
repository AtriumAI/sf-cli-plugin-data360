import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionReplace extends CrudUpdateCommand {
  public static readonly summary = 'Replace Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection replace --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId';

  protected readonly updateMethod = 'PUT' as const;
}
