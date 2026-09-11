import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';
import { dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360SegmentCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 segment.';
  public static readonly examples = ['$ sf data360 segment create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    ...dataspaceFlag,
  };

  protected readonly endpoint = '/segments';

  // eslint-disable-next-line class-methods-use-this
  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { dataspace: flags.dataspace as string };
  }
}
