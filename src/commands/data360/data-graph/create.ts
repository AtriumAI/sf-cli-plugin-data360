import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataGraphCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 data graph.';
  public static readonly examples = ['$ sf data360 data-graph create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/data-graphs';
}
