import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

type DataSpaceDetail = {
  name: string;
  label: string;
  description: string;
  status: string;
  id: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DataSpaceGet extends CrudGetCommand<DataSpaceDetail> {
  public static readonly summary = 'Get a Data 360 data space.';
  public static readonly examples = ['$ sf data360 data-space get --target-org myorg --name default'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Data space name or ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-spaces/:idOrName';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'description', name: 'Description' },
    { key: 'status', name: 'Status' },
    { key: 'id', name: 'ID' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DataSpaceDetail {
    return {
      name: str(record.name),
      label: str(record.label),
      description: str(record.description),
      status: str(record.status),
      id: str(record.id),
    };
  }
}
