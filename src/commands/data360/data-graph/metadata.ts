import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags, dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360DataGraphMetadata extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Metadata Data 360 data graph.';
  public static readonly examples = ['$ sf data360 data-graph metadata --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    ...dataspaceFlag,
    'entity-name': Flags.string({
      summary: 'Restrict the read to one data graph entity. An unknown name returns 404 from the graph service.',
    }),
  };

  protected readonly endpoint = '/data-graphs/metadata';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return {
      dataspace: flags.dataspace as string,
      dataGraphEntityName: flags['entity-name'] as string | undefined,
    };
  }
}
