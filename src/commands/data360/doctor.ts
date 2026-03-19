import { Data360Command, data360Flags } from '../../shared/data360/Data360Command.js';
import { ssotGet, SsotTiming } from '../../shared/data360/ssotClient.js';

type SearchIndexResponse = {
  semanticSearchDefinitionDetails?: unknown[];
};

export type Data360DoctorResult = {
  status: 'ok';
  org: string;
  instanceUrl: string;
  apiVersion: string;
  indexCount: number;
};

export default class Data360Doctor extends Data360Command<Data360DoctorResult> {
  public static readonly summary = 'Validate Data 360 connectivity for a target org.';
  public static readonly description =
    'Checks that the target org has a working Data 360 instance by listing search indexes.';
  public static readonly examples = ['$ sf data360 doctor --target-org myorg'];
  public static readonly enableJsonFlag = true;
  public static readonly aliases = ['data360 validate connection'];
  public static readonly deprecateAliases = true;

  public static readonly flags = {
    ...data360Flags,
  };

  public async run(): Promise<Data360DoctorResult> {
    await this.parseData360Flags();

    let ssotTiming: SsotTiming | undefined;
    const response = await ssotGet<SearchIndexResponse>(this.org, this.apiVersion, '/search-index', {
      onTiming: (t) => {
        ssotTiming = t;
      },
    });
    const indexCount = Array.isArray(response.semanticSearchDefinitionDetails)
      ? response.semanticSearchDefinitionDetails.length
      : 0;
    const connection = this.org.getConnection(this.apiVersion);

    const result: Data360DoctorResult = {
      status: 'ok',
      org: this.org.getUsername() ?? connection.getUsername() ?? '',
      instanceUrl: connection.instanceUrl,
      apiVersion: this.apiVersion,
      indexCount,
    };

    this.styledHeader('Data 360 Connectivity');
    this.table({
      data: [result],
      columns: [
        { key: 'status', name: 'Status' },
        { key: 'org', name: 'Org' },
        { key: 'apiVersion', name: 'API Version' },
        { key: 'indexCount', name: 'Indexes' },
        { key: 'instanceUrl', name: 'Instance URL' },
      ],
    });

    this.emitTiming(ssotTiming?.totalMs ?? 0, ssotTiming);
    return result;
  }
}
