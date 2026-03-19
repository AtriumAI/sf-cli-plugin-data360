import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionFields extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Fields Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection fields --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/objects/:resourceName/fields';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
