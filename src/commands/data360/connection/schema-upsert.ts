import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionSchemaUpsert extends CrudUpdateCommand {
  public static readonly summary = 'Schema upsert Data 360 connection.';
  public static readonly examples = ['$ sf data360 connection schema-upsert --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/schema';

  protected readonly updateMethod = 'PUT' as const;
}
