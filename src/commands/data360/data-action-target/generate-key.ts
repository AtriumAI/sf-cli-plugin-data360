import { Flags } from '@salesforce/sf-plugins-core';
import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataActionTargetGenerateKey extends CrudCreateCommand {
  public static readonly summary = 'Generate key Data 360 data action target.';
  public static readonly examples = ['$ sf data360 data-action-target generate-key --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-action-targets/:apiName/signing-key';
}
