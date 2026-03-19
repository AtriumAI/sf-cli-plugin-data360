import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ActivationTargetUpdate extends CrudUpdateCommand {
  public static readonly summary = 'Update Data 360 activation target.';
  public static readonly examples = ['$ sf data360 activation-target update --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/activation-targets/:activationTargetId';
}
