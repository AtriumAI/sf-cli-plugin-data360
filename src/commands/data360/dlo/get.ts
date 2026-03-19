import { Flags } from '@salesforce/sf-plugins-core';
import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

type DloDetail = {
  name: string;
  label: string;
  category: string;
  status: string;
  fieldCount: number;
  dataspace: string;
  createdDate: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DloGet extends CrudGetCommand<DloDetail> {
  public static readonly summary = 'Get a Data 360 Data Lake Object (DLO).';
  public static readonly examples = ['$ sf data360 dlo get --target-org myorg --name MyDLO__dll'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'DLO developer name or record ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/data-lake-objects/:recordIdOrDeveloperName';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'category', name: 'Category' },
    { key: 'status', name: 'Status' },
    { key: 'fieldCount', name: 'Fields' },
    { key: 'dataspace', name: 'Data Space' },
    { key: 'createdDate', name: 'Created' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DloDetail {
    // API returns { dataLakeObjects: [...] } — unwrap to first element
    const dlos = Array.isArray(record.dataLakeObjects) ? record.dataLakeObjects : [record];
    const r = (typeof dlos[0] === 'object' && dlos[0] !== null ? dlos[0] : record) as Record<string, unknown>;
    const fields = Array.isArray(r.fields) ? r.fields : [];
    const spaces = Array.isArray(r.dataSpaceInfo) ? r.dataSpaceInfo : [];
    return {
      name: str(r.name),
      label: str(r.label),
      category: str(r.category),
      status: str(r.status),
      fieldCount: fields.length,
      dataspace: spaces.map((s: Record<string, unknown>) => str(s.name)).join(', ') || '-',
      createdDate: str(r.createdDate),
    };
  }
}
