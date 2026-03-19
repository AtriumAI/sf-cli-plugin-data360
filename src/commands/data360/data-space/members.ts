import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataSpaceMembers extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List members of a Data 360 data space.';
  public static readonly examples = ['$ sf data360 data-space members --target-org myorg --name default'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the data space.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-spaces/:idOrName/members';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
