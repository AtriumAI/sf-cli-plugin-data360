import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DataKitStatus extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Status Data 360 data kit.';
  public static readonly examples = [
    '$ sf data360 data-kit status --target-org myorg --name Sales --component Account',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Data kit name.',
      required: true,
    }),
    component: Flags.string({
      summary: 'Data kit component name.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-kits/:dataKitName/components/:componentName/deployment-status';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected pathParams(flags: Record<string, unknown>): Record<string, string> {
    return { dataKitName: flags.name as string, componentName: flags.component as string };
  }
}
