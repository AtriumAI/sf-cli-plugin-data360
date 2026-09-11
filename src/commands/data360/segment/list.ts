import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';
import { dataspaceFlag } from '../../../shared/data360/Data360Command.js';

export default class Data360SegmentList extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'List Data 360 segment.';
  public static readonly examples = ['$ sf data360 segment list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    ...dataspaceFlag,
  };

  protected readonly endpoint = '/segments';

  protected readonly arrayKey = 'segments';

  protected readonly columns = [
    { key: 'apiName', name: 'API Name' },
    { key: 'displayName', name: 'Display Name' },
    { key: 'segmentStatus', name: 'Status' },
    { key: 'segmentType', name: 'Type' },
    { key: 'publishStatus', name: 'Publish Status' },
    { key: 'lastSegmentMemberCount', name: 'Members' },
  ];

  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { ...super.queryParams(flags), dataspace: flags.dataspace as string };
  }
}
