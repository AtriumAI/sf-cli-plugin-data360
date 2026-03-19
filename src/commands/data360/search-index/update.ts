import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360SearchIndexUpdate extends CrudUpdateCommand {
  public static readonly summary = 'Update Data 360 search index.';
  public static readonly examples = ['$ sf data360 search-index update --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
  };

  protected readonly endpoint = '/search-index/:searchIndexApiNameOrId';
}
