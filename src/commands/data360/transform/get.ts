import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

type TransformDetail = {
  name: string;
  label: string;
  type: string;
  status: string;
  lastRunStatus: string;
  lastRunDate: string;
  createdBy: string;
  lastModifiedDate: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360TransformGet extends CrudGetCommand<TransformDetail> {
  public static readonly summary = 'Get a Data 360 data transform.';
  public static readonly examples = ['$ sf data360 transform get --target-org myorg --name MyTransform'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Transform name or ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-transforms/:dataTransformNameOrId';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'type', name: 'Type' },
    { key: 'status', name: 'Status' },
    { key: 'lastRunStatus', name: 'Last Run' },
    { key: 'lastRunDate', name: 'Last Run Date' },
    { key: 'createdBy', name: 'Created By' },
    { key: 'lastModifiedDate', name: 'Modified' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): TransformDetail {
    return {
      name: str(record.name),
      label: str(record.label),
      type: str(record.type),
      status: str(record.status),
      lastRunStatus: str(record.lastRunStatus),
      lastRunDate: str(record.lastRunDate),
      createdBy:
        typeof record.createdBy === 'object' && record.createdBy !== null
          ? str((record.createdBy as Record<string, unknown>).name ?? (record.createdBy as Record<string, unknown>).id)
          : str(record.createdBy),
      lastModifiedDate: str(record.lastModifiedDate),
    };
  }
}
