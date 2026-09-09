import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DocaiGenerateSchema extends CrudActionCommand {
  public static readonly summary = 'Generate a Document AI extraction schema from sample files.';
  public static readonly description =
    'Posts sample documents to the org-level generate-schema action and returns a JSON schema. The definition ' +
    'file carries the model and the files to read: { "mlModel": "...", "files": [ { "mimeType": "...", ' +
    '"data": "<base64>" } ] }. The action is not scoped to a Document AI configuration, so there is no --name. ' +
    'Read the generated schema with --json.';
  public static readonly examples = ['$ sf data360 docai generate-schema --target-org myorg -f invoice-sample.json'];
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

  protected readonly endpoint = '/document-processing/actions/generate-schema';
}
