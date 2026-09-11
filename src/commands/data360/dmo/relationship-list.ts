import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, ListResult, listFlags } from '../../../shared/data360/crudBase.js';
import { dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360DmoRelationshipList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Relationship list Data 360 dmo.';
  public static readonly examples = ['$ sf data360 dmo relationship-list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    ...dataspaceFlag,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
    'creation-type': Flags.string({
      summary: 'Filter by how the relationship was created, e.g. Standard or Custom.',
    }),
    status: Flags.string({
      summary: 'Filter by relationship status, e.g. Active or Inactive.',
    }),
    'sort-by': Flags.string({
      summary: 'Sort field: DeveloperName (default), CreatedDate, LastModifiedDate or CreationType.',
    }),
    'order-by': Flags.string({
      summary: 'Sort direction, asc or desc. Unlike segment list, this endpoint takes a direction, not an expression.',
    }),
  };

  protected readonly endpoint = '/data-model-objects/:dataModelObjectName/relationships';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
  ];

  public async run(): Promise<ListResult<Record<string, unknown>>> {
    const { flags } = await this.parse(Data360DmoRelationshipList);
    (this as unknown as { endpoint: string }).endpoint = this.endpoint.replace(
      ':dataModelObjectName',
      encodeURIComponent(flags.name)
    );
    return super.run();
  }

  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return {
      ...super.queryParams(flags),
      dataspace: flags.dataspace as string,
      creationType: flags['creation-type'] as string | undefined,
      status: flags.status as string | undefined,
      sortBy: flags['sort-by'] as string | undefined,
      orderBy: flags['order-by'] as string | undefined,
    };
  }
}
