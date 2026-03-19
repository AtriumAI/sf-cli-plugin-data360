import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionConnectorList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Connector list Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection connector-list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/connectors';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
