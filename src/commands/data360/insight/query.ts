import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360InsightQuery extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Query Data 360 insight.';
  public static readonly examples = ['$ sf data360 insight query --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/insight/calculated-insights/:ciName';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
