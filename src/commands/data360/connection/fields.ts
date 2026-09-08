import { Flags } from '@salesforce/sf-plugins-core';
import { CrudListCommand, listFlags } from '../../../shared/data360/crudBase.js';

export default class Data360ConnectionFields extends CrudListCommand<Record<string, unknown>> {
  public static readonly summary = 'Fields Data 360 connection.';
  public static readonly examples = [
    '$ sf data360 connection fields --target-org myorg --name 0hMdL000001lCRlUAM --object Account',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...listFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Connection ID.',
      required: true,
    }),
    object: Flags.string({
      summary: 'Source object (resource) name within the connection.',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/objects/:resourceName/fields';

  /** POST-only: GET answers "HTTP Method 'GET' not allowed. Allowed are POST". */
  protected readonly httpMethod: 'GET' | 'POST' = 'POST';

  /** The response nests the field list under `fields`, alongside `primaryKeys`. */
  protected readonly arrayKey = 'fields';

  // `status` is not a key of the documented response; `type` is what callers need.
  protected readonly columns = [
    { key: 'name', name: 'Name' },
    { key: 'type', name: 'Type' },
    { key: 'isRequired', name: 'Required' },
  ];

  // eslint-disable-next-line class-methods-use-this
  protected pathParams(flags: Record<string, unknown>): Record<string, string> {
    return { connectionId: flags.name as string, resourceName: flags.object as string };
  }

  /** Postman's minimal body; `filters` is optional and deliberately omitted. */
  // eslint-disable-next-line class-methods-use-this
  protected buildBody(): Record<string, unknown> {
    return { advancedAttributes: {} };
  }
}
