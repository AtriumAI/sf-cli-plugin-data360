import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ActivationTargetList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 activation target.';
  public static readonly examples = ['$ sf data360 activation-target list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/activation-targets';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
