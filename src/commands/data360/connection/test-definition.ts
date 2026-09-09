import { SfError } from '@salesforce/core';
import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand, MutationResult } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360ConnectionTestDefinition extends CrudActionCommand {
  public static readonly summary = 'Test a connector definition before creating the connection.';
  public static readonly description =
    'Posts a connector definition — connectorType, method and the credential/parameter attributes — and reports ' +
    'whether it can connect. Nothing is created. Use "connection test" or "connection test-existing" to test a ' +
    'connection that already exists. A definition that cannot connect exits non-zero; read the reported errors ' +
    'with --json or --raw.';
  public static readonly examples = [
    '$ sf data360 connection test-definition --target-org myorg -f redshift-candidate.json',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    // Re-declared, not spread: spreading an inherited flag yields an unnameable type that fails declaration emit.
    'definition-file': Flags.file({
      char: 'f',
      summary: 'Path to a JSON definition file. Use "-" for stdin.',
      exists: false,
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/actions/test';

  /** The API reports a failed connection as a 200 with success: false, which must not exit 0. */
  public async run(): Promise<MutationResult> {
    const result = await super.run();
    if (result.data?.success === false) {
      const error = new SfError(
        'The connector definition could not connect. Re-run with --json or --raw for the reported errors.',
        'DATA360_CONNECTION_TEST_FAILED'
      );
      error.data = result.data as SfError['data'];
      throw error;
    }
    return result;
  }
}
