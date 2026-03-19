import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DocaiConfigCreate extends CrudCreateCommand {
  public static readonly summary = 'Config create Data 360 docai.';
  public static readonly examples = ['$ sf data360 docai config-create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/document-processing/configurations';
}
