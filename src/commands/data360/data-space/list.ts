import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

type DataSpaceRecord = {
  name: string;
  label: string;
  description: string;
  status: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DataSpaceList extends CrudListCommand<DataSpaceRecord> {
  public static readonly summary = 'List Data 360 data spaces.';
  public static readonly examples = ['$ sf data360 data-space list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/data-spaces';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'description', name: 'Description' },
    { key: 'status', name: 'Status' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DataSpaceRecord {
    return {
      name: str(record.name),
      label: str(record.label),
      description: str(record.description),
      status: str(record.status),
    };
  }
}
