import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360SearchIndexCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 search index.';
  public static readonly examples = ['$ sf data360 search-index create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/search-index';
}
