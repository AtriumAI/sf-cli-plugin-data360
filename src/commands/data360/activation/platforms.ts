import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360ActivationPlatforms extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Platforms Data 360 activation.';
  public static readonly examples = ['$ sf data360 activation platforms --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/activation-external-platforms';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
