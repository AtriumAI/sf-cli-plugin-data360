import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataActionTargetList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 data action target.';
  public static readonly examples = ['$ sf data360 data-action-target list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/data-action-targets';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
