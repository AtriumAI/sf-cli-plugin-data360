import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DataGraphMetadata extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Metadata Data 360 data graph.';
  public static readonly examples = ['$ sf data360 data-graph metadata --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/data-graphs/metadata';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
