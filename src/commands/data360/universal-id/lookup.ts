import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360UniversalIdLookup extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Lookup Data 360 universal id.';
  public static readonly examples = ['$ sf data360 universal-id lookup --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/universalIdLookup/:entityName/:dataSourceId/:dataSourceObjectId/:sourceRecordId';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];
}
