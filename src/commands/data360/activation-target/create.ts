import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ActivationTargetCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 activation target.';
  public static readonly examples = ['$ sf data360 activation-target create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/activation-targets';
}
