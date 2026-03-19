import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

type DmoRecord = {
  name: string;
  label: string;
  category: string;
  fieldCount: number;
  segmentable: string;
  dataspace: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DmoList extends CrudListCommand<DmoRecord> {
  public static readonly summary = 'List Data 360 Data Model Objects (DMOs).';
  public static readonly examples = ['$ sf data360 dmo list --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/data-model-objects';
  // DMO API returns max 50 per page regardless of requested batchSize
  protected readonly batchSize = 50;

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'label', name: 'Label' },
    { key: 'category', name: 'Category' },
    { key: 'fieldCount', name: 'Fields' },
    { key: 'segmentable', name: 'Segmentable' },
    { key: 'dataspace', name: 'Data Space' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): DmoRecord {
    const fields = Array.isArray(record.fields) ? record.fields : [];
    return {
      name: str(record.name),
      label: str(record.label),
      category: str(record.category),
      fieldCount: fields.length,
      segmentable: record.isSegmentable ? 'Yes' : 'No',
      dataspace: str(record.dataSpaceName),
    };
  }
}
