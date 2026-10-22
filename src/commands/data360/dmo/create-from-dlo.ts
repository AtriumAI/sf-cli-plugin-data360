import { SfError } from '@salesforce/core';
import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags, dataspaceFlag } from '../../../shared/data360/Data360Command.js';
import { ssotGet, ssotPost } from '../../../shared/data360/ssotClient.js';
import { normalizeMetadataColumns, QueryResponse } from '../../../shared/data360/queryResult.js';
import { quoteIdentifier } from '../../../shared/data360/sql.js';
import { buildPath } from '../../../shared/data360/pathBuilder.js';

// ─── Type mapping: DLO SQL types → DMO field types ───

// Fallback only, for a field the DLO declares no dataType for. The mapping POST
// enforces type parity, so DATE must not widen to DateTime.
const TYPE_MAP: Record<string, string> = {
  VARCHAR: 'Text',
  DECIMAL: 'Number',
  BIGINT: 'Number',
  INTEGER: 'Number',
  DOUBLE: 'Number',
  FLOAT: 'Number',
  BOOLEAN: 'Boolean',
  TIMESTAMP: 'DateTime',
  'TIMESTAMP WITH TIME ZONE': 'DateTime',
  DATE: 'Date',
};

const SKIP_FIELDS = new Set([
  'DataSource__c',
  'DataSourceObject__c',
  'InternalOrganization__c',
  'cdp_sys_SourceVersion__c',
]);

type CreateFromDloResult = {
  dlo: string;
  dmo: string;
  fieldCount: number;
  mappingCount: number;
};

type DmoField = { name: string; label: string; dataType: string; isPrimaryKey: boolean };
type FieldPair = { sourceFieldDeveloperName: string; targetFieldDeveloperName: string };

const toDmoType = (sqlType: string): string => TYPE_MAP[sqlType.toUpperCase()] ?? 'Text';

// A Currency field makes the API add this system field to the DMO, so the DLO's copy maps onto it.
const RECORD_CURRENCY_FIELD = 'cdp_sys_record_currency__c';

/** The DLO's own field types; its SQL schema reads a Currency field as DECIMAL. */
const declaredTypes = (response: Record<string, unknown>): Map<string, string> => {
  // Wrapped as { dataLakeObjects: [...] }, which dlo get unwraps the same way.
  const dlos = Array.isArray(response.dataLakeObjects) ? (response.dataLakeObjects as unknown[]) : [response];
  const fields = (dlos[0] as { fields?: unknown } | undefined)?.fields;
  const types = new Map<string, string>();
  for (const f of Array.isArray(fields) ? (fields as Array<{ name?: unknown; dataType?: unknown }>) : []) {
    if (typeof f?.name === 'string' && typeof f.dataType === 'string' && f.dataType) types.set(f.name, f.dataType);
  }
  return types;
};

const isSkippedField = (name: string): boolean =>
  SKIP_FIELDS.has(name) || name.startsWith('KQ_') || !name.endsWith('__c');

const isFilteredOut = (name: string, include: Set<string> | null, exclude: Set<string> | null): boolean => {
  if (include && !include.has(name)) return true;
  if (exclude && exclude.has(name)) return true;
  return false;
};

const buildDmoFieldsFromColumns = (
  columns: Array<{ name: string; type: string }>,
  types: Map<string, string>,
  include: Set<string> | null,
  exclude: Set<string> | null
): { dmoFields: DmoField[]; fieldMapping: FieldPair[]; skippedByFilter: number } => {
  const dmoFields: DmoField[] = [];
  const fieldMapping: FieldPair[] = [];
  let skippedByFilter = 0;
  let pkFound = false;

  for (const col of columns) {
    if (isSkippedField(col.name) || col.name === RECORD_CURRENCY_FIELD) continue;
    if (isFilteredOut(col.name, include, exclude)) {
      skippedByFilter++;
      continue;
    }

    const stripped = col.name.replace(/__c$/, '');
    const dmoFieldName = `${stripped}_c`;
    const isPk = !pkFound && (stripped.toLowerCase() === 'id' || stripped.toLowerCase() === 'id_c');
    if (isPk) pkFound = true;

    dmoFields.push({
      name: dmoFieldName,
      label: stripped.replace(/_/g, ' '),
      dataType: types.get(col.name) ?? toDmoType(col.type),
      isPrimaryKey: isPk,
    });

    fieldMapping.push({
      sourceFieldDeveloperName: col.name,
      targetFieldDeveloperName: `${dmoFieldName}__c`,
    });
  }

  if (!pkFound && dmoFields.length > 0) {
    dmoFields[0].isPrimaryKey = true;
  }

  if (dmoFields.some((f) => f.dataType === 'Currency') && columns.some((c) => c.name === RECORD_CURRENCY_FIELD)) {
    fieldMapping.push({
      sourceFieldDeveloperName: RECORD_CURRENCY_FIELD,
      targetFieldDeveloperName: RECORD_CURRENCY_FIELD,
    });
  }

  return { dmoFields, fieldMapping, skippedByFilter };
};

export default class Data360DmoCreateFromDlo extends Data360Command<CreateFromDloResult> {
  public static readonly summary = 'Create a DMO from an existing DLO with auto-mapping.';
  public static readonly description =
    "Describes the DLO schema, creates a DMO whose fields take the DLO fields' declared types, then creates the DLO→DMO field mapping. A Currency field also maps the DLO's cdp_sys_record_currency__c onto the DMO's system field of that name.";
  public static readonly examples = [
    '$ sf data360 dmo create-from-dlo --target-org myorg --dlo ADL_GF_EAT_Docs__dll',
    '$ sf data360 dmo create-from-dlo --target-org myorg --dlo MyData__dll --dmo MyCustomDMO --category Other',
    '$ sf data360 dmo create-from-dlo --target-org myorg --dlo Case_Home__dll --include-fields Id__c,Subject__c,Status__c',
    '$ sf data360 dmo create-from-dlo --target-org myorg --dlo Account_Home__dll --exclude-fields Description__c,Website__c',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    dlo: Flags.string({
      summary: 'DLO developer name (e.g., MyData__dll).',
      required: true,
    }),
    dmo: Flags.string({
      summary: 'DMO name to create. Defaults to DLO name without __dll suffix.',
    }),
    category: Flags.string({
      summary: 'DMO category.',
      default: 'Other',
      options: ['Profile', 'Engagement', 'Other'],
    }),
    ...dataspaceFlag,
    'include-fields': Flags.string({
      summary: 'Comma-separated list of DLO field names to include. Only these fields will be mapped.',
    }),
    'exclude-fields': Flags.string({
      summary: 'Comma-separated list of DLO field names to exclude from mapping.',
    }),
  };

  public async run(): Promise<CreateFromDloResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360DmoCreateFromDlo);

    const dloName = flags.dlo;
    const baseName = dloName.replace(/__dll$/, '');
    const dmoName = flags.dmo ?? baseName;
    const dmoTableName = `${dmoName}__dlm`;
    const category = flags.category.toUpperCase();
    const dataspace = flags.dataspace;

    // Parse field filters
    const includeFields = flags['include-fields']
      ? new Set(flags['include-fields'].split(',').map((f: string) => f.trim()))
      : null;
    const excludeFields = flags['exclude-fields']
      ? new Set(flags['exclude-fields'].split(',').map((f: string) => f.trim()))
      : null;

    if (includeFields && excludeFields) {
      this.error('Cannot use both --include-fields and --exclude-fields at the same time.');
    }

    // Step 1: Describe DLO to get field schema
    this.log(`Describing DLO: ${dloName}`);
    const describeResponse = await ssotPost<QueryResponse>(this.org, this.apiVersion, '/query', {
      sql: `SELECT * FROM ${quoteIdentifier(dloName)} LIMIT 0`,
    });

    const columns = normalizeMetadataColumns(describeResponse.metadata ?? {});
    if (columns.length === 0) {
      this.error(`No columns found for DLO "${dloName}". Is the name correct?`);
    }

    // Step 2: Build DMO fields from DLO columns, typed as the DLO declares them
    const dlo = await ssotGet<Record<string, unknown>>(
      this.org,
      this.apiVersion,
      buildPath('/data-lake-objects/:recordIdOrDeveloperName', { recordIdOrDeveloperName: dloName })
    );
    const { dmoFields, fieldMapping, skippedByFilter } = buildDmoFieldsFromColumns(
      columns,
      declaredTypes(dlo),
      includeFields,
      excludeFields
    );

    const filterMsg = skippedByFilter > 0 ? ` (${skippedByFilter} skipped by filter)` : '';
    this.log(`Found ${dmoFields.length} mappable fields from ${columns.length} total columns.${filterMsg}`);

    // Step 3: Create DMO
    this.log(`Creating DMO: ${dmoName}`);
    const dmoPayload = {
      name: dmoName,
      label: dmoName.replace(/_/g, ' '),
      category,
      dataSpaceName: dataspace,
      fields: dmoFields,
    };

    await ssotPost<Record<string, unknown>>(this.org, this.apiVersion, '/data-model-objects', dmoPayload);
    this.log(`DMO "${dmoName}" created with ${dmoFields.length} fields.`);

    // Step 4: Create DLO→DMO field mapping
    this.log(`Creating field mapping: ${dloName} → ${dmoTableName}`);
    const mappingPayload = {
      sourceEntityDeveloperName: dloName,
      targetEntityDeveloperName: dmoTableName,
      fieldMapping,
    };

    const mappingPath = buildPath('/data-model-object-mappings', undefined, { dataspace });
    try {
      await ssotPost<Record<string, unknown>>(this.org, this.apiVersion, mappingPath, mappingPayload);
    } catch (error) {
      // The DMO POST is not rolled back, so a mapping failure leaves an orphan.
      throw new SfError(
        `The DMO "${dmoTableName}" was created, but its field mapping failed, so "${dmoTableName}" is now an unmapped orphan. Re-running this command fails at the DMO step because that name already exists. Cause: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'DATA360_ORPHAN_DMO',
        [
          `Delete the orphan, then retry: sf data360 dmo delete --target-org ${
            this.org.getUsername() ?? '<org>'
          } --name ${dmoTableName}`,
          `Or keep the DMO and create only the mapping: sf data360 dmo mapping-create --target-org ${
            this.org.getUsername() ?? '<org>'
          } --definition-file <file> (sourceEntityDeveloperName ${dloName}, targetEntityDeveloperName ${dmoTableName})`,
        ]
      );
    }
    this.log(`Field mapping created with ${fieldMapping.length} field pairs.`);

    const result: CreateFromDloResult = {
      dlo: dloName,
      dmo: dmoTableName,
      fieldCount: dmoFields.length,
      mappingCount: fieldMapping.length,
    };

    this.styledHeader('DMO Created from DLO');
    this.table({
      data: [result],
      columns: [
        { key: 'dlo', name: 'Source DLO' },
        { key: 'dmo', name: 'Target DMO' },
        { key: 'fieldCount', name: 'Fields' },
        { key: 'mappingCount', name: 'Mappings' },
      ],
    });

    return result;
  }
}
