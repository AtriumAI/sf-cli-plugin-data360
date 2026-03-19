import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, ListResult, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DmoRelationshipList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Relationship list Data 360 dmo.';
  public static readonly examples = ['$ sf data360 dmo relationship-list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
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
}
