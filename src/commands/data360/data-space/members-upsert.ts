import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DataSpaceMembersUpsert extends CrudUpdateCommand {
  public static readonly summary = 'Members upsert Data 360 data space.';
  public static readonly examples = ['$ sf data360 data-space members-upsert --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-spaces/:idOrName/members';

  protected readonly updateMethod = 'PUT' as const;
}
