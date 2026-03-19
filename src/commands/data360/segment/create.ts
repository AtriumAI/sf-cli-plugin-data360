import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360SegmentCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 segment.';
  public static readonly examples = ['$ sf data360 segment create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/segments';
}
