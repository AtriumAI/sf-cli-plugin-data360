import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DocaiGlobalConfig extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Global config Data 360 docai.';
  public static readonly examples = ['$ sf data360 docai global-config --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/document-processing/global-config';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
