import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360InsightMetadata extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Metadata Data 360 insight.';
  public static readonly examples = ['$ sf data360 insight metadata --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/insight/metadata';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
