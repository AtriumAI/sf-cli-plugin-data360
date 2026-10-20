/**
 * Tier 3: dmo create-from-dlo — declared DLO type → DMO type, SQL fallback.
 *
 * The mapping POST enforces type parity with the DLO field, so a mistyped field
 * fails the mapping half and leaves an orphan DMO behind the successful DMO POST.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import DmoCreateFromDlo from '../../../src/commands/data360/dmo/create-from-dlo.js';

type DmoField = { name: string; label: string; dataType: string; isPrimaryKey: boolean };
type FieldPair = { sourceFieldDeveloperName: string; targetFieldDeveloperName: string };

const baseFlags = {
  'target-org': {},
  'api-version': '66.0',
  timing: false,
  dlo: 'Healthcare_CarePlan__dll',
  category: 'Other',
  dataspace: 'default',
};

/** The describe step reads column types out of the /query response's metadata map. */
const metadataFor = (columns: Record<string, string>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(columns).map(([name, type], index) => [name, { type, placeInOrder: index }]));

const runWithColumns = async (columns: Record<string, string>) =>
  runCommand(DmoCreateFromDlo, {
    flags: baseFlags,
    responses: new Map<string, unknown>([['/query', { data: [], metadata: metadataFor(columns) }]]),
    defaultResponse: {},
  });

const dloRecord = (fields: Array<[string, string]>) => ({
  dataLakeObjects: [
    { name: 'Healthcare_CarePlan__dll', fields: fields.map(([name, dataType]) => ({ name, dataType })) },
  ],
});

const runWithDeclared = async (columns: Record<string, string>, declared: Array<[string, string]>) =>
  runCommand(DmoCreateFromDlo, {
    flags: baseFlags,
    responses: new Map<string, unknown>([
      ['/query', { data: [], metadata: metadataFor(columns) }],
      ['/data-lake-objects/Healthcare_CarePlan__dll', dloRecord(declared)],
    ]),
    defaultResponse: {},
  });

const dmoFields = (body: unknown): DmoField[] => (body as { fields: DmoField[] }).fields;
const fieldPairs = (body: unknown): FieldPair[] => (body as { fieldMapping: FieldPair[] }).fieldMapping;
const fieldNamed = (fields: DmoField[], name: string): DmoField => {
  const found = fields.find((f) => f.name === name);
  assert.ok(found, `expected a DMO field named ${name}`);
  return found;
};

describe('dmo create-from-dlo type derivation', () => {
  it('derives a DMO Date from a DLO DATE column', async () => {
    const { requestLog } = await runWithColumns({ Id__c: 'VARCHAR', Start_Date__c: 'DATE' });

    const dmoPost = requestLog[2];
    assert.equal(dmoPost.method, 'POST');
    assert.ok(dmoPost.url.includes('/data-model-objects'));
    assert.equal(fieldNamed(dmoFields(dmoPost.body), 'Start_Date_c').dataType, 'Date');
  });

  it('still derives DateTime from TIMESTAMP columns', async () => {
    const { requestLog } = await runWithColumns({
      Id__c: 'VARCHAR',
      Created__c: 'TIMESTAMP',
      Modified__c: 'TIMESTAMP WITH TIME ZONE',
    });

    const fields = dmoFields(requestLog[2].body);
    assert.equal(fieldNamed(fields, 'Created_c').dataType, 'DateTime');
    assert.equal(fieldNamed(fields, 'Modified_c').dataType, 'DateTime');
  });

  it('keeps the DMO field type in parity with its source DLO column', async () => {
    const columns = {
      Id__c: 'VARCHAR',
      Start_Date__c: 'DATE',
      Created__c: 'TIMESTAMP',
      Amount__c: 'DECIMAL',
      Active__c: 'BOOLEAN',
    };
    const expected: Record<string, string> = {
      VARCHAR: 'Text',
      DATE: 'Date',
      TIMESTAMP: 'DateTime',
      DECIMAL: 'Number',
      BOOLEAN: 'Boolean',
    };

    const { requestLog, result } = await runWithColumns(columns);
    const fields = dmoFields(requestLog[2].body);
    const pairs = fieldPairs(requestLog[3].body);

    // Every mapped pair points at a DMO field whose type matches its DLO column.
    assert.equal(pairs.length, fields.length);
    for (const pair of pairs) {
      const dmoField = fieldNamed(fields, pair.targetFieldDeveloperName.replace(/__c$/, ''));
      assert.equal(dmoField.dataType, expected[columns[pair.sourceFieldDeveloperName as keyof typeof columns]]);
    }

    assert.equal(requestLog[3].method, 'POST');
    assert.ok(requestLog[3].url.includes('/data-model-object-mappings'));
    assert.equal(result.fieldCount, 5);
    assert.equal(result.mappingCount, 5);
    assert.equal(result.dmo, 'Healthcare_CarePlan__dlm');
  });

  it('falls back to Text for an unmapped SQL type', async () => {
    const { requestLog } = await runWithColumns({ Id__c: 'VARCHAR', Blob__c: 'GEOGRAPHY' });

    assert.equal(fieldNamed(dmoFields(requestLog[2].body), 'Blob_c').dataType, 'Text');
  });

  it('reads the DLO record before creating anything', async () => {
    const { requestLog } = await runWithColumns({ Id__c: 'VARCHAR' });
    assert.equal(requestLog[1].method, 'GET');
    assert.ok(requestLog[1].url.endsWith('/ssot/data-lake-objects/Healthcare_CarePlan__dll'));
  });

  it('types each DMO field from the DLO field it maps, not its SQL column', async () => {
    const declared: Array<[string, string]> = [
      ['Id__c', 'Text'],
      ['Amount__c', 'Currency'],
      ['Rate__c', 'Percent'],
      ['Mail__c', 'Email'],
      ['Tel__c', 'Phone'],
      ['Site__c', 'Url'],
    ];
    const { requestLog } = await runWithDeclared(
      {
        Id__c: 'VARCHAR',
        Amount__c: 'DECIMAL',
        Rate__c: 'DECIMAL',
        Mail__c: 'VARCHAR',
        Tel__c: 'VARCHAR',
        Site__c: 'VARCHAR',
      },
      declared
    );
    const fields = dmoFields(requestLog[2].body);
    for (const [name, type] of declared) assert.equal(fieldNamed(fields, name.replace(/__c$/, '_c')).dataType, type);
  });

  it('falls back to the SQL type for a field the DLO declares no type for', async () => {
    const { requestLog } = await runWithDeclared({ Id__c: 'VARCHAR', Start__c: 'DATE' }, [['Id__c', 'Text']]);
    assert.equal(fieldNamed(dmoFields(requestLog[2].body), 'Start_c').dataType, 'Date');
  });

  it('maps the record-currency field onto the DMO system field when a Currency field lands', async () => {
    const { requestLog } = await runWithDeclared(
      { Id__c: 'VARCHAR', Amount__c: 'DECIMAL', cdp_sys_record_currency__c: 'VARCHAR' },
      [
        ['Id__c', 'Text'],
        ['Amount__c', 'Currency'],
        ['cdp_sys_record_currency__c', 'Text'],
      ]
    );
    assert.ok(!dmoFields(requestLog[2].body).some((f) => f.name.startsWith('cdp_sys_record_currency')));
    assert.deepEqual(
      fieldPairs(requestLog[3].body).find((p) => p.sourceFieldDeveloperName === 'cdp_sys_record_currency__c'),
      { sourceFieldDeveloperName: 'cdp_sys_record_currency__c', targetFieldDeveloperName: 'cdp_sys_record_currency__c' }
    );
  });

  it('drops the record-currency field when no Currency field lands', async () => {
    const { requestLog } = await runWithDeclared({ Id__c: 'VARCHAR', cdp_sys_record_currency__c: 'VARCHAR' }, [
      ['Id__c', 'Text'],
      ['cdp_sys_record_currency__c', 'Text'],
    ]);
    assert.ok(!dmoFields(requestLog[2].body).some((f) => f.name.startsWith('cdp_sys_record_currency')));
    assert.ok(!fieldPairs(requestLog[3].body).some((p) => p.sourceFieldDeveloperName === 'cdp_sys_record_currency__c'));
  });

  it('maps the record-currency field even when --include-fields omits it', async () => {
    const { requestLog } = await runCommand(DmoCreateFromDlo, {
      flags: { ...baseFlags, 'include-fields': 'Id__c,Amount__c' },
      responses: new Map<string, unknown>([
        [
          '/query',
          {
            data: [],
            metadata: metadataFor({ Id__c: 'VARCHAR', Amount__c: 'DECIMAL', cdp_sys_record_currency__c: 'VARCHAR' }),
          },
        ],
        [
          '/data-lake-objects/Healthcare_CarePlan__dll',
          dloRecord([
            ['Id__c', 'Text'],
            ['Amount__c', 'Currency'],
          ]),
        ],
      ]),
      defaultResponse: {},
    });
    assert.ok(fieldPairs(requestLog[3].body).some((p) => p.targetFieldDeveloperName === 'cdp_sys_record_currency__c'));
  });

  it('fails before the DMO POST when the DLO read fails', async () => {
    const lines: string[] = [];
    await assert.rejects(
      runCommand(DmoCreateFromDlo, {
        flags: baseFlags,
        responses: new Map<string, unknown>([
          ['/query', { data: [], metadata: metadataFor({ Id__c: 'VARCHAR' }) }],
          ['/data-lake-objects/', new Error('503')],
        ]),
        defaultResponse: {},
        onLog: (line) => lines.push(line),
      }),
      (error: Error & { name?: string }) => {
        assert.notEqual(error.name, 'DATA360_ORPHAN_DMO');
        return true;
      }
    );
    assert.ok(!lines.some((line) => line.startsWith('Creating DMO')));
  });

  describe('a failed mapping POST names the orphan DMO it left behind', () => {
    const runWithFailingMapping = async () =>
      runCommand(DmoCreateFromDlo, {
        flags: baseFlags,
        responses: new Map<string, unknown>([
          ['/query', { data: [], metadata: metadataFor({ Id__c: 'VARCHAR', Start_Date__c: 'DATE' }) }],
          ['/data-model-object-mappings', new Error('type Date is different from type DateTime')],
        ]),
        defaultResponse: {},
      });

    it('reports the orphan by name instead of only the wrapped API error', async () => {
      await assert.rejects(runWithFailingMapping, (error: Error) => {
        assert.ok(
          error.message.includes('Healthcare_CarePlan__dlm'),
          `expected the orphan DMO name in: ${error.message}`
        );
        assert.ok(error.message.includes('orphan'), `expected the orphan to be called out in: ${error.message}`);
        assert.ok(
          error.message.includes('type Date is different from type DateTime'),
          `expected the underlying cause to survive in: ${error.message}`
        );
        return true;
      });
    });

    it('offers both exits: delete the orphan, or create only the mapping', async () => {
      await assert.rejects(runWithFailingMapping, (error: Error & { actions?: string[] }) => {
        const actions = error.actions ?? [];
        assert.equal(actions.length, 2, `expected two recovery actions, got ${JSON.stringify(actions)}`);
        assert.ok(actions[0].includes('dmo delete'));
        assert.ok(actions[0].includes('Healthcare_CarePlan__dlm'));
        assert.ok(actions[1].includes('dmo mapping-create'));
        assert.ok(actions[1].includes('Healthcare_CarePlan__dll'));
        return true;
      });
    });

    it('raises DATA360_ORPHAN_DMO, distinguishing it from a plain API error', async () => {
      await assert.rejects(runWithFailingMapping, (error: Error & { name?: string }) => {
        assert.equal(error.name, 'DATA360_ORPHAN_DMO');
        return true;
      });
    });
  });
});
