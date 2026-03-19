import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

type SearchIndexRecord = {
  name: string;
  status: string;
  type: string;
  sourceDmo: string;
};

export type Data360SearchIndexListResult = {
  data: SearchIndexRecord[];
  totalSize: number;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360SearchIndexList extends CrudListCommand<SearchIndexRecord> {
  public static readonly summary = 'List Data 360 search indexes.';
  public static readonly description = 'Returns all semantic search index definitions for the target org.';
  public static readonly examples = ['$ sf data360 search-index list --target-org myorg'];
  public static readonly enableJsonFlag = true;
  public static readonly aliases = ['data360 list indexes'];
  public static readonly deprecateAliases = true;

  public static readonly flags = {
    ...listFlags,
  };

  protected readonly endpoint = '/search-index';
  protected readonly arrayKey = 'semanticSearchDefinitionDetails';

  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'status', name: 'Status' },
    { key: 'type', name: 'Type' },
    { key: 'sourceDmo', name: 'Source DMO' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown>): SearchIndexRecord {
    return {
      name: str(record.developerName),
      status: str(record.runtimeStatus),
      type: str(record.searchType),
      sourceDmo: str(record.sourceDmoDeveloperName),
    };
  }
}
