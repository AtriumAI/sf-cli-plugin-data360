import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360TransformCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 transform.';
  public static readonly examples = ['$ sf data360 transform create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/data-transforms';
}
