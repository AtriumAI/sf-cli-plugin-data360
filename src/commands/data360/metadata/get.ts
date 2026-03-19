import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360MetadataGet extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Get Data 360 metadata.';
  public static readonly examples = ['$ sf data360 metadata get --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/data-graphs/metadata';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'primaryObjectName', name: 'Primary DMO' },
    { key: 'lastRunStatus', name: 'Last Run' },
  ];
}
