import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360IdentityResolutionList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 identity resolution.';
  public static readonly examples = ['$ sf data360 identity-resolution list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/identity-resolutions';

  protected readonly columns = [
    { key: 'label', name: 'Label' },
    { key: 'rulesetStatus', name: 'Status' },
    { key: 'lastJobStatus', name: 'Last Job' },
    { key: 'totalUnifiedProfiles', name: 'Unified Profiles' },
    { key: 'consolidationRate', name: 'Consolidation %' },
  ];
}
