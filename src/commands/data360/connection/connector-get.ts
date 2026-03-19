import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

type ConnectorDetail = {
  connectorType: string;
  label: string;
  category: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360ConnectionConnectorGet extends CrudGetCommand<ConnectorDetail> {
  public static readonly summary = 'Get details of a Data 360 connector type.';
  public static readonly examples = [
    '$ sf data360 connection connector-get --target-org myorg --name SalesforceDotCom',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Connector type name (e.g., SalesforceDotCom, S3, SFTP).',
      required: true,
    }),
  };

  protected readonly endpoint = '/connectors/:connectorType';

  protected readonly columns = [
    { key: 'connectorType', name: 'Connector Type' },
    { key: 'label', name: 'Label' },
    { key: 'category', name: 'Category' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): ConnectorDetail {
    return {
      connectorType: str(record.connectorType ?? record.name),
      label: str(record.label),
      category: str(record.category),
    };
  }
}
