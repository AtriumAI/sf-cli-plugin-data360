import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataActionCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 data action.';
  public static readonly examples = ['$ sf data360 data-action create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/data-actions';
}
