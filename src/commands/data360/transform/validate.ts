import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360TransformValidate extends CrudActionCommand {
  public static readonly summary = 'Validate a data transform definition before creating it.';
  public static readonly description =
    'Posts a full transform definition — the same shape "transform create" takes — to the validation endpoint. ' +
    'A valid definition returns an example of the target object output structure; an invalid one returns the ' +
    'issues found, each with an error code, message and severity. Nothing is created either way. Read the ' +
    'result with --json: the command reports only that the call succeeded, not whether the definition is valid.';
  public static readonly examples = ['$ sf data360 transform validate --target-org myorg -f transform.json'];
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

  protected readonly endpoint = '/data-transforms-validation';
}
