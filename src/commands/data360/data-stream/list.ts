import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

type DataStreamRecord = {
  name: string;
  label: string;
  status: string;
  lastRunStatus: string;
  connectorType: string;
  streamType: string;
  totalRecords: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));
const num = (v: unknown): string => (typeof v === 'number' ? v.toLocaleString() : str(v));

export default class Data360DataStreamList extends CrudListCommand<DataStreamRecord> {
  public static readonly summary = 'List Data 360 data streams.';
  public static readonly examples = ['$ sf data360 data-stream list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/data-streams';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'status', name: 'Status' },
    { key: 'lastRunStatus', name: 'Last Run' },
    { key: 'connectorType', name: 'Connector' },
    { key: 'streamType', name: 'Type' },
    { key: 'totalRecords', name: 'Records' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DataStreamRecord {
    const connInfo = record.connectorInfo as Record<string, unknown> | undefined;
    return {
      name: str(record.name),
      label: str(record.label),
      status: str(record.status),
      lastRunStatus: str(record.lastRunStatus),
      connectorType: str(connInfo?.connectorType),
      streamType: str(record.dataStreamType),
      totalRecords: num(record.totalRecords),
    };
  }
}
