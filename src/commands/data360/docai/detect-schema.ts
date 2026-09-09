import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DocaiDetectSchema extends CrudActionCommand {
  public static readonly summary = 'Detect which extraction schema best matches a document.';
  public static readonly description =
    'Scores a document against named extraction schemas and returns the matches above the threshold. The ' +
    'definition file carries the candidate schemas, the model, the files and the mode: { ' +
    '"schemaConfigurations": [...], "mlModel": "...", "files": [ { "mimeType": "...", "data": "<base64>" } ], ' +
    '"mode": "Single" }. Read the matches with --json.';
  public static readonly examples = [
    '$ sf data360 docai detect-schema --target-org myorg -f invoice.json',
    '$ sf data360 docai detect-schema --target-org myorg -f invoice.json --threshold 0.9',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    // The endpoint exists from v67.0 only, so it cannot inherit the 66.0 default.
    'api-version': Flags.string({
      summary: 'API version to use for Data 360 requests.',
      default: '67.0',
    }),
    // Re-declared, not spread: spreading an inherited flag yields an unnameable type that fails declaration emit.
    'definition-file': Flags.file({
      char: 'f',
      summary: 'Path to a JSON definition file. Use "-" for stdin.',
      exists: false,
      required: true,
    }),
    threshold: Flags.string({
      summary: 'Minimum matching score (0-1) for a schema to be returned. The API default is 0.80.',
    }),
  };

  protected readonly endpoint = '/document-processing/actions/detect-schema';

  // eslint-disable-next-line class-methods-use-this
  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { threshold: flags.threshold as string | undefined };
  }
}
