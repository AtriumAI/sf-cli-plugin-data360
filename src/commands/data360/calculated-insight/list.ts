import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';
import { dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360CalculatedInsightList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 calculated insight.';
  public static readonly examples = ['$ sf data360 calculated-insight list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    ...dataspaceFlag,
  };

  protected readonly endpoint = '/calculated-insights';
  protected readonly arrayKey = 'collection.items';

  protected readonly columns = [
    { key: 'apiName', name: 'API Name' },
    { key: 'displayName', name: 'Display Name' },
    { key: 'calculatedInsightStatus', name: 'Status' },
  ];

  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { ...super.queryParams(flags), dataspace: flags.dataspace as string };
  }
}
