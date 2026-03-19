import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

type ConnectionRecord = {
  name: string;
  connectorType: string;
  status: string;
  label: string;
  id: string;
};

export default class Data360ConnectionList extends CrudListCommand<ConnectionRecord> {
  public static readonly summary = 'List Data 360 connections by connector type.';
  public static readonly examples = [
    '$ sf data360 connection list --target-org myorg --connector-type SalesforceDotCom',
    '$ sf data360 connection list --target-org myorg --connector-type REDSHIFT',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    'connector-type': Flags.string({
      char: 'c',
      summary: 'Connector type (e.g., SalesforceDotCom, REDSHIFT, S3). Required by the API.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'connectorType', name: 'Connector Type' },
    { key: 'status', name: 'Status' },
    { key: 'label', name: 'Label' },
    { key: 'id', name: 'ID' },
  ];

  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return {
      ...super.queryParams(flags),
      connectorType: flags['connector-type'] as string,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): ConnectionRecord {
    return {
      name: str(record.name),
      connectorType: str(record.connectorType),
      status: str(record.status),
      label: str(record.label),
      id: str(record.id),
    };
  }
}
