import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360IdentityResolutionCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 identity resolution.';
  public static readonly examples = ['$ sf data360 identity-resolution create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/identity-resolutions';
}
