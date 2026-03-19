import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ActivationCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 activation.';
  public static readonly examples = ['$ sf data360 activation create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/activations';
}
