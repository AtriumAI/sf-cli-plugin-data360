import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360ProfileMetadata extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Metadata Data 360 profile.';
  public static readonly examples = ['$ sf data360 profile metadata --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/profile/metadata';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
