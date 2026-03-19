import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

type DloRecord = {
  name: string;
  label: string;
  category: string;
  status: string;
  fieldCount: number;
  dataspace: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DloList extends CrudListCommand<DloRecord> {
  public static readonly summary = 'List Data 360 Data Lake Objects (DLOs).';
  public static readonly examples = ['$ sf data360 dlo list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/data-lake-objects';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'category', name: 'Category' },
    { key: 'status', name: 'Status' },
    { key: 'fieldCount', name: 'Fields' },
    { key: 'dataspace', name: 'Data Space' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DloRecord {
    const fields = Array.isArray(record.fields) ? record.fields : [];
    const spaces = Array.isArray(record.dataSpaceInfo) ? record.dataSpaceInfo : [];
    return {
      name: str(record.name),
      label: str(record.label),
      category: str(record.category),
      status: str(record.status),
      fieldCount: fields.length,
      dataspace: spaces.map((s: Record<string, unknown>) => str(s.name)).join(', ') || '-',
    };
  }
}
