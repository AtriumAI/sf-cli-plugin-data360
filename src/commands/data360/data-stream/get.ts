import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

type DataStreamDetail = {
  name: string;
  label: string;
  status: string;
  lastRunStatus: string;
  connectorType: string;
  streamType: string;
  totalRecords: string;
  lastRefreshDate: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));
const num = (v: unknown): string => (typeof v === 'number' ? v.toLocaleString() : str(v));

export default class Data360DataStreamGet extends CrudGetCommand<DataStreamDetail> {
  public static readonly summary = 'Get a Data 360 data stream.';
  public static readonly examples = ['$ sf data360 data-stream get --target-org myorg --name Account_Home'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Data stream name or record ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-streams/:recordIdOrDeveloperName';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'status', name: 'Status' },
    { key: 'lastRunStatus', name: 'Last Run' },
    { key: 'connectorType', name: 'Connector' },
    { key: 'streamType', name: 'Type' },
    { key: 'totalRecords', name: 'Records' },
    { key: 'lastRefreshDate', name: 'Last Refresh' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DataStreamDetail {
    const connInfo = record.connectorInfo as Record<string, unknown> | undefined;
    return {
      name: str(record.name),
      label: str(record.label),
      status: str(record.status),
      lastRunStatus: str(record.lastRunStatus),
      connectorType: str(connInfo?.connectorType),
      streamType: str(record.dataStreamType),
      totalRecords: num(record.totalRecords),
      lastRefreshDate: str(record.lastRefreshDate),
    };
  }
}
