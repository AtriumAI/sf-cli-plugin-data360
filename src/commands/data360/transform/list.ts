import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

type TransformRecord = {
  name: string;
  label: string;
  type: string;
  status: string;
  lastRunStatus: string;
  lastRunDate: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360TransformList extends CrudListCommand<TransformRecord> {
  public static readonly summary = 'List Data 360 data transforms.';
  public static readonly examples = ['$ sf data360 transform list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/data-transforms';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'type', name: 'Type' },
    { key: 'status', name: 'Status' },
    { key: 'lastRunStatus', name: 'Last Run' },
    { key: 'lastRunDate', name: 'Last Run Date' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): TransformRecord {
    return {
      name: str(record.name),
      label: str(record.label),
      type: str(record.type),
      status: str(record.status),
      lastRunStatus: str(record.lastRunStatus),
      lastRunDate: str(record.lastRunDate),
    };
  }
}
