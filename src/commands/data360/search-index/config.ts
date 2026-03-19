import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360SearchIndexConfig extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Config Data 360 search index.';
  public static readonly examples = ['$ sf data360 search-index config --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/search-index/config';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
