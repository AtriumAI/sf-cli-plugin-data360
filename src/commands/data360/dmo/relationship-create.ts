import { Flags } from '@salesforce/sf-plugins-core';
import { CrudCreateCommand, MutationResult, mutationFlags } from '../../../shared/data360/crudBase.js';
import { dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360DmoRelationshipCreate extends CrudCreateCommand {
  public static readonly summary = 'Relationship create Data 360 dmo.';
  public static readonly examples = ['$ sf data360 dmo relationship-create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    ...dataspaceFlag,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-model-objects/:dataModelObjectName/relationships';

  public async run(): Promise<MutationResult> {
    const { flags } = await this.parse(Data360DmoRelationshipCreate);
    (this as unknown as { endpoint: string }).endpoint = this.endpoint.replace(
      ':dataModelObjectName',
      encodeURIComponent(flags.name)
    );
    return super.run();
  }

  // eslint-disable-next-line class-methods-use-this
  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { dataspace: flags.dataspace as string };
  }
}
