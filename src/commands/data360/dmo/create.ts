import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DmoCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 dmo.';
  public static readonly examples = ['$ sf data360 dmo create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/data-model-objects';
}
