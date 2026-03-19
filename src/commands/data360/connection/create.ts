import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/connections';
}
