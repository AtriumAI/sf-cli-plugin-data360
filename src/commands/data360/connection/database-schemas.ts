import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionDatabaseSchemas extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Database schemas Data 360 connection.';
  public static readonly examples = [
    '$ sf data360 connection database-schemas --target-org myorg --name 0hMdL000001lCRlUAM',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    name: Flags.string({
      char: 'n',
      // This endpoint does no name resolution, unlike `connection databases`.
      summary: 'Connection ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/database-schemas';

  /** POST-only: GET answers "HTTP Method 'GET' not allowed. Allowed are POST". */
  protected readonly httpMethod: 'GET' | 'POST' = 'POST';

  /** The response nests the schema names under `schemas`. */
  protected readonly arrayKey = 'schemas';

  // `status` is not a key of the documented response, whose elements are bare names.
  protected readonly columns = [{ key: 'name', name: 'Name' }];

  /** Postman's body also carries `advancedAttributes.databaseName`; no flag exposes it yet. */
  // eslint-disable-next-line class-methods-use-this
  protected buildBody(): Record<string, unknown> {
    return { advancedAttributes: {} };
  }

  /** `schemas` holds plain strings, so give the table the column key it renders. */
  // eslint-disable-next-line class-methods-use-this
  protected mapRecord(record: Record<string, unknown> | string): Record<string, unknown> {
    return typeof record === 'string' ? { name: record } : record;
  }
}
