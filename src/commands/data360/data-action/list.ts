import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';
import { dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360DataActionList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 data action.';
  public static readonly examples = ['$ sf data360 data-action list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    ...dataspaceFlag,
  };

  protected readonly endpoint = '/data-actions';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];

  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { ...super.queryParams(flags), dataspace: flags.dataspace as string };
  }
}
