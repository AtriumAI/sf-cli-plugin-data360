import { Flags } from '@salesforce/sf-plugins-core';
import { Data360Command, data360Flags } from '../../../shared/data360/Data360Command.js';
import { ssotGet, ssotPost } from '../../../shared/data360/ssotClient.js';
import { normalizeMetadataColumns, QueryResponse } from '../../../shared/data360/queryResult.js';
import { quoteIdentifier } from '../../../shared/data360/sql.js';
import { buildPath, injectResourceId } from '../../../shared/data360/pathBuilder.js';

/**
 * Known synonyms: DLO base name → canonical DMO base name.
 * These handle cases where the CRM field name differs from the canonical name.
 */
const SYNONYMS: Record<string, string[]> = {
  email: ['emailaddress'],
  phone: ['phonenumber', 'formattede164phone', 'telephonenumber'],
  homephone: ['formattede164phone'],
  mobilephone: ['phonenumber'],
  name: ['personname'],
  id: ['externalrecordid', 'id', 'individualid', 'contactpointemailid', 'partyid'],
  accountid: ['primaryaccountid', 'account'],
  birthdate: ['birthdate'],
  title: ['titlename'],
  donotcall: ['hasoptedoutsolicit'],
  hasoptedoutofemail: ['hasoptedoutemail'],
  mailingstreet: ['addressline1'],
  mailingcity: ['cityname'],
  mailingstate: ['stateprovincename'],
  mailingpostalcode: ['postalcodeid'],
  mailingcountry: ['countryname'],
};

const SKIP_DLO_FIELDS = new Set([
  'DataSource__c',
  'DataSourceObject__c',
  'InternalOrganization__c',
  'cdp_sys_SourceVersion__c',
]);

type FieldMapping = {
  sourceFieldDeveloperName: string;
  targetFieldDeveloperName: string;
  matchType: string;
};

type MapResult = {
  dlo: string;
  dmo: string;
  mapped: number;
  unmapped: number;
  mappings: FieldMapping[];
};

/**
 * Normalize a field name to a comparable base form.
 * Strips prefixes (ssot__, KQ_), suffixes (__c, _c__c, __dll, __dlm),
 * and lowercases.
 */
const toBase = (name: string): string =>
  name
    .replace(/^ssot__/, '')
    .replace(/^KQ_/, '')
    .replace(/_c__c$/, '') // CRM-ingested custom field suffix
    .replace(/__c$/, '')
    .replace(/_c$/, '')
    .toLowerCase();

export default class Data360DmoMapToCanonical extends Data360Command<MapResult> {
  public static readonly summary = 'Map a DLO to a canonical (ssot__) DMO with auto-matching.';
  public static readonly description =
    'Describes the DLO fields, fetches the canonical DMO fields, auto-matches by name similarity, ' +
    'and creates the field mapping. Use --dry-run to preview the mapping without creating it.';
  public static readonly examples = [
    '$ sf data360 dmo map-to-canonical -o myorg --dlo Contact_Home__dll --dmo ssot__Individual__dlm --dry-run',
    '$ sf data360 dmo map-to-canonical -o myorg --dlo Contact_Home__dll --dmo ssot__ContactPointEmail__dlm',
    '$ sf data360 dmo map-to-canonical -o myorg --dlo Case_Home__dll --dmo ssot__Case__dlm --include-fields Id__c,Status__c,Subject__c',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...data360Flags,
    dlo: Flags.string({
      summary: 'DLO developer name (e.g., Contact_Home__dll).',
      required: true,
    }),
    dmo: Flags.string({
      summary: 'Canonical DMO name (e.g., ssot__Individual__dlm).',
      required: true,
    }),
    dataspace: Flags.string({
      summary: 'Data space name.',
      default: 'default',
    }),
    'include-fields': Flags.string({
      summary: 'Comma-separated DLO field names to include.',
    }),
    'exclude-fields': Flags.string({
      summary: 'Comma-separated DLO field names to exclude.',
    }),
    map: Flags.string({
      summary: 'Manual mapping overrides as DloField=DmoField pairs, comma-separated.',
      description: 'Example: --map Id__c=ssot__PartyId__c,Email__c=ssot__EmailAddress__c',
    }),
    'dry-run': Flags.boolean({
      summary: 'Preview the mapping without creating it.',
      default: false,
    }),
  };

  // eslint-disable-next-line complexity
  public async run(): Promise<MapResult> {
    await this.parseData360Flags();
    const { flags } = await this.parse(Data360DmoMapToCanonical);

    const dloName = flags.dlo;
    const dmoName = flags.dmo;
    const dataspace = flags.dataspace;
    const dryRun = flags['dry-run'];

    const includeFields = flags['include-fields']
      ? new Set(flags['include-fields'].split(',').map((f: string) => f.trim()))
      : null;
    const excludeFields = flags['exclude-fields']
      ? new Set(flags['exclude-fields'].split(',').map((f: string) => f.trim()))
      : null;

    if (includeFields && excludeFields) {
      this.error('Cannot use both --include-fields and --exclude-fields.');
    }

    // Step 1: Describe DLO fields via SQL metadata
    this.log(`Describing DLO: ${dloName}`);
    const describeResponse = await ssotPost<QueryResponse>(this.org, this.apiVersion, '/query', {
      sql: `SELECT * FROM ${quoteIdentifier(dloName)} LIMIT 0`,
    });

    const dloColumns = normalizeMetadataColumns(describeResponse.metadata ?? {});
    if (dloColumns.length === 0) {
      this.error(`No columns found for DLO "${dloName}".`);
    }

    // Step 2: Fetch canonical DMO fields
    this.log(`Fetching DMO: ${dmoName}`);
    const dmoApiName = dmoName.endsWith('__dlm') ? dmoName : `${dmoName}__dlm`;
    const dmoPath = injectResourceId('/data-model-objects/:name', dmoApiName);
    const dmoResponse = await ssotGet<Record<string, unknown>>(this.org, this.apiVersion, dmoPath);
    const dmoFields: Array<{ name: string; label?: string }> = Array.isArray(dmoResponse.fields)
      ? (dmoResponse.fields as Array<{ name: string; label?: string }>)
      : [];

    if (dmoFields.length === 0) {
      this.error(`No fields found for DMO "${dmoName}".`);
    }

    // Build DMO field lookup by base name
    const dmoByBase = new Map<string, string>();
    for (const f of dmoFields) {
      dmoByBase.set(toBase(f.name), f.name);
    }

    // Parse manual mapping overrides — supports duplicate source keys
    const manualOverrides: Array<{ src: string; tgt: string }> = [];
    if (flags.map) {
      for (const pair of flags.map.split(',')) {
        const [src, tgt] = pair.split('=').map((s: string) => s.trim());
        if (src && tgt) manualOverrides.push({ src, tgt });
      }
    }

    // Step 3: Match DLO fields to DMO fields
    const mappings: FieldMapping[] = [];
    const unmappedDlo: string[] = [];

    // Build a set of DLO fields that have manual overrides (to avoid duplicate auto-matching)
    const manualSources = new Set(manualOverrides.map((o) => o.src));

    // First, add all manual overrides (supports duplicate source keys)
    for (const { src, tgt } of manualOverrides) {
      mappings.push({
        sourceFieldDeveloperName: src,
        targetFieldDeveloperName: tgt,
        matchType: 'manual',
      });
    }

    for (const col of dloColumns) {
      const dloField = col.name;

      // Skip system fields and KQ_ fields
      if (SKIP_DLO_FIELDS.has(dloField)) continue;
      if (dloField.startsWith('KQ_')) continue;
      if (dloField.startsWith('cdp_sys_')) continue;

      // Apply field filters
      if (includeFields && !includeFields.has(dloField)) continue;
      if (excludeFields && excludeFields.has(dloField)) continue;

      // Skip fields that already have manual overrides
      if (manualSources.has(dloField)) continue;

      const dloBase = toBase(dloField);

      // Pass 1: Exact base match
      let dmoMatch = dmoByBase.get(dloBase);
      let matchType = 'exact';

      // Pass 2: Synonym match
      if (!dmoMatch) {
        const syns = SYNONYMS[dloBase];
        if (syns) {
          for (const syn of syns) {
            if (dmoByBase.has(syn)) {
              dmoMatch = dmoByBase.get(syn);
              matchType = 'synonym';
              break;
            }
          }
        }
      }

      // Pass 3: Prefix match — DLO base starts with DMO base or vice versa
      // Only for bases >= 5 chars to avoid false positives on short names like 'id', 'age'
      if (!dmoMatch) {
        for (const [base, fullName] of dmoByBase) {
          if (dloBase.length >= 5 && base.length >= 5 && (base.startsWith(dloBase) || dloBase.startsWith(base))) {
            dmoMatch = fullName;
            matchType = 'prefix';
            break;
          }
        }
      }

      if (dmoMatch) {
        mappings.push({
          sourceFieldDeveloperName: dloField,
          targetFieldDeveloperName: dmoMatch,
          matchType,
        });
      } else {
        unmappedDlo.push(dloField);
      }
    }

    // Display results
    this.styledHeader(`${dryRun ? '[DRY RUN] ' : ''}Mapping: ${dloName} → ${dmoName}`);

    if (mappings.length > 0) {
      this.table({
        data: mappings.map((m) => ({
          source: m.sourceFieldDeveloperName,
          target: m.targetFieldDeveloperName,
          match: m.matchType,
        })),
        columns: [
          { key: 'source', name: 'DLO Field' },
          { key: 'target', name: 'DMO Field' },
          { key: 'match', name: 'Match' },
        ],
      });
    }

    this.log(`\nMatched: ${mappings.length}  |  Unmatched: ${unmappedDlo.length}`);

    if (unmappedDlo.length > 0 && unmappedDlo.length <= 20) {
      this.log(`Unmatched DLO fields: ${unmappedDlo.join(', ')}`);
    }

    // Step 4: Create mapping (unless dry-run)
    if (!dryRun && mappings.length > 0) {
      const mappingPayload = {
        sourceEntityDeveloperName: dloName,
        targetEntityDeveloperName: dmoName.endsWith('__dlm') ? dmoName : `${dmoName}__dlm`,
        fieldMapping: mappings.map((m) => ({
          sourceFieldDeveloperName: m.sourceFieldDeveloperName,
          targetFieldDeveloperName: m.targetFieldDeveloperName,
        })),
      };

      const mappingPath = buildPath('/data-model-object-mappings', undefined, { dataspace });
      await ssotPost<Record<string, unknown>>(this.org, this.apiVersion, mappingPath, mappingPayload);
      this.log(`\nMapping created with ${mappings.length} field pairs.`);
    } else if (dryRun) {
      this.log('\n--dry-run: no mapping created. Remove --dry-run to create.');
    }

    return {
      dlo: dloName,
      dmo: dmoName,
      mapped: mappings.length,
      unmapped: unmappedDlo.length,
      mappings,
    };
  }
}
