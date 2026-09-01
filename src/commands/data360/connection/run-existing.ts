import { Flags } from '@salesforce/sf-plugins-core';
import { CrudActionCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360ConnectionRunExisting extends CrudActionCommand {
  public static readonly summary = 'Run existing Data 360 connection.';
  public static readonly examples = [
    '$ sf data360 connection run-existing --target-org myorg --name 0hMdL000001lCRlUAM --command run',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    name: Flags.string({
      char: 'n',
      summary: 'Connection ID.',
      required: true,
    }),
    command: Flags.string({
      summary: 'Connection action to run (the :command path segment).',
      required: true,
    }),
  };

  protected readonly endpoint = '/connections/:connectionId/actions/:command';

  // eslint-disable-next-line class-methods-use-this
  protected pathParams(flags: Record<string, unknown>): Record<string, string> {
    return { connectionId: flags.name as string, command: flags.command as string };
  }
}
