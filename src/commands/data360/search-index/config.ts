import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360SearchIndexConfig extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Get configuration for a Data 360 search index.';
  public static readonly examples = ['$ sf data360 search-index config --target-org myorg --name My_kav'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Search index developer name or ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/search-index/:searchIndexId/config';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
