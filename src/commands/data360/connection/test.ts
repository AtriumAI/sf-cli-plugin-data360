import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360ConnectionTest extends CrudActionCommand {
  public static readonly summary = 'Test Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection test --target-org myorg --name MyConnection'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the connection to test.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/actions/test';
}
