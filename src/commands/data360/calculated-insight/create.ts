import { CrudCreateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360CalculatedInsightCreate extends CrudCreateCommand {
  public static readonly summary = 'Create Data 360 calculated insight.';
  public static readonly examples = ['$ sf data360 calculated-insight create --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
  };

  protected readonly endpoint = '/calculated-insights';
}
