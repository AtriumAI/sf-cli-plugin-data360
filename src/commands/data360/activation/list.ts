import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ActivationList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 activation.';
  public static readonly examples = ['$ sf data360 activation list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/activations';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
