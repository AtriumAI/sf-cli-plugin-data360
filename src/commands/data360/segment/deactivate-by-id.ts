import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360SegmentDeactivateById extends CrudActionCommand {
  public static readonly summary = 'Deactivate by id Data 360 segment.';
  public static readonly examples = ['$ sf data360 segment deactivate-by-id --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/segments/:segmentId/actions/deactivate';
}
