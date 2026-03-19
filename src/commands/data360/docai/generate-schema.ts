import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DocaiGenerateSchema extends CrudActionCommand {
  public static readonly summary = 'Generate schema for a Document AI configuration.';
  public static readonly examples = ['$ sf data360 docai generate-schema --target-org myorg --name MyDocConfig'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Document AI configuration name or ID.',
      required: true,
    }),
  };

  protected readonly endpoint = '/document-processing/configurations/:idOrApiName/actions/generate-schema';
}
