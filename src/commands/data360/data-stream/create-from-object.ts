import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotPost } from '../../../shared/data360/ssotClient.js';

type CreateStreamResult = {
  name: string;
  status: string;
  recordId: string;
  dlo: string;
  sourceObject: string;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));

export default class Data360DataStreamCreateFromObject extends Data360Command<CreateStreamResult> {
  public static readonly summary = 'Create a CRM data stream from a Salesforce object.';
  public static readonly description =
    'Creates a data stream that ingests records from a Salesforce standard or custom object into a Data Lake Object (DLO). ' +
    'The platform auto-discovers all fields from the source object. Field selection for modeling happens at the DLO→DMO mapping step.';
  public static readonly examples = [
    '$ sf data360 data-stream create-from-object -o myorg --object Case --category Engagement --event-date-field CreatedDate',
    '$ sf data360 data-stream create-from-object -o myorg --object Account --category Profile',
    '$ sf data360 data-stream create-from-object -o myorg --object Order --category Other --name Custom_Order_Stream',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    object: Flags.string({
      summary: 'Salesforce object API name (e.g., Case, Account, Order__c).',
      required: true,
    }),
    category: Flags.string({
      summary: 'DLO category. Engagement requires --event-date-field.',
      default: 'Profile',
      options: ['Profile', 'Engagement', 'Other'],
    }),
    'event-date-field': Flags.string({
      summary: 'DateTime field for Engagement category streams (e.g., CreatedDate).',
    }),
    name: Flags.string({
      char: 'n',
      summary: 'Stream name. Defaults to <Object>_Home.',
    }),
    dataspace: Flags.string({
      summary: 'Data space name.',
      default: 'default',
    }),
    'refresh-mode': Flags.string({
      summary: 'Data refresh mode.',
      default: 'UPSERT',
      options: ['UPSERT', 'APPEND', 'OVERWRITE'],
    }),
  };

  public async run(): Promise<CreateStreamResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360DataStreamCreateFromObject);

    const sourceObject = flags.object;
    const category = flags.category;
    const streamName = flags.name ?? `${sourceObject}_Home`;
    const dloName = `${streamName}__dll`;
    const dataspace = flags.dataspace;
    const refreshMode = flags['refresh-mode'];
    const eventDateField = flags['event-date-field'];

    if (category === 'Engagement' && !eventDateField) {
      this.error('--event-date-field is required for Engagement category streams.');
    }

    // Build DLO info
    const dataLakeObjectInfo: Record<string, unknown> = {
      label: streamName,
      name: dloName,
      category,
      dataspaceInfo: [{ name: dataspace }],
    };

    if (category === 'Engagement' && eventDateField) {
      dataLakeObjectInfo.eventDateTimeFieldName = eventDateField;
    }

    const payload = {
      name: streamName,
      label: streamName,
      datasource: 'Salesforce_Home',
      datastreamType: 'SFDC',
      connectorInfo: {
        connectorType: 'SalesforceDotCom',
        connectorDetails: {
          name: 'SalesforceDotCom_Home',
          sourceObject,
        },
      },
      dataLakeObjectInfo,
      refreshConfig: {
        refreshMode,
        isAccelerationEnabled: false,
      },
    };

    this.log(`Creating data stream: ${streamName} (${sourceObject} → ${dloName})`);

    const response = await ssotPost<Record<string, unknown>>(this.org, this.apiVersion, '/data-streams', payload);

    const dloInfo = response.dataLakeObjectInfo as Record<string, unknown> | undefined;
    const result: CreateStreamResult = {
      name: str(response.name ?? streamName),
      status: str(response.status),
      recordId: str(response.recordId ?? response.id),
      dlo: str(dloInfo?.name ?? dloName),
      sourceObject,
    };

    this.styledHeader('Data Stream Created');
    this.table({
      data: [result],
      columns: [
        { key: 'name', name: 'Stream' },
        { key: 'sourceObject', name: 'SF Object' },
        { key: 'dlo', name: 'DLO' },
        { key: 'status', name: 'Status' },
        { key: 'recordId', name: 'Record ID' },
      ],
    });

    this.log('\nNext steps:');
    this.log(`  sf data360 data-stream run -o ${this.org.getUsername()} --name ${result.name}`);
    this.log(`  sf data360 dmo create-from-dlo -o ${this.org.getUsername()} --dlo ${result.dlo}`);

    return result;
  }
}
