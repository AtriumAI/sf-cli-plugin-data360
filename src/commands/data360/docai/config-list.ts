import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DocaiConfigList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Config list Data 360 docai.';
  public static readonly examples = ['$ sf data360 docai config-list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/document-processing/configurations';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
