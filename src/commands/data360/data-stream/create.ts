import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataStreamCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 data stream.';
  public static readonly examples = ['$ sf data360 data-stream create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/data-streams';
}
