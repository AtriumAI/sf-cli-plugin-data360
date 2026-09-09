import { CrudGetCommand } from '../../../shared/data360/crudBase.js';
import { data360Flags } from '../../../shared/data360/Data360Command.js';

export default class Data360SearchIndexConfig extends CrudGetCommand<Record<string, unknown>> {
  public static readonly summary = 'Get the org-level semantic search configuration.';
  public static readonly description =
    'Returns the org-wide semantic search configuration: the supported chunking strategies and the per-file-' +
    'extension defaults. It is not scoped to one search index, so there is no --name. The response nests the ' +
    'whole configuration in a single JSON string field; read it with --json or --raw.';
  public static readonly examples = ['$ sf data360 search-index config --target-org myorg'];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
  };

  protected readonly endpoint = '/search-index/config';

  protected readonly columns = [{ key: 'config', name: 'Config' }];
}
