import { Flags } from '@salesforce/sf-plugins-core';
import { CrudDeleteCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360DataStreamDelete extends CrudDeleteCommand {
  public static readonly summary = 'Delete Data 360 data stream.';
  public static readonly examples = [
    '$ sf data360 data-stream delete --target-org myorg --name Account_Home',
    '$ sf data360 data-stream delete --target-org myorg --name Account_Home --keep-dlo',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Name or ID of the resource.',
      required: true,
    }),
    'keep-dlo': Flags.boolean({
      summary: 'Keep the associated Data Lake Object when deleting the data stream.',
      default: false,
    }),
  };

  protected readonly endpoint = '/data-streams/:recordIdOrDeveloperName';

  // eslint-disable-next-line class-methods-use-this
  protected deleteQueryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return {
      shouldDeleteDataLakeObject: flags['keep-dlo'] === true ? 'false' : 'true',
    };
  }
}
