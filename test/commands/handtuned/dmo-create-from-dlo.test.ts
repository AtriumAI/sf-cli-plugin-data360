/**
 * Tier 3: dmo create-from-dlo — DLO SQL type → DMO field type derivation.
 *
 * The mapping POST enforces type parity with the DLO column, so a widened type
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

    const dmoPost = requestLog[1];
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

    const fields = dmoFields(requestLog[1].body);
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
    const fields = dmoFields(requestLog[1].body);
    const pairs = fieldPairs(requestLog[2].body);

    // Every mapped pair points at a DMO field whose type matches its DLO column.
    assert.equal(pairs.length, fields.length);
    for (const pair of pairs) {
      const dmoField = fieldNamed(fields, pair.targetFieldDeveloperName.replace(/__c$/, ''));
      assert.equal(dmoField.dataType, expected[columns[pair.sourceFieldDeveloperName as keyof typeof columns]]);
    }

    assert.equal(requestLog[2].method, 'POST');
    assert.ok(requestLog[2].url.includes('/data-model-object-mappings'));
    assert.equal(result.fieldCount, 5);
    assert.equal(result.mappingCount, 5);
    assert.equal(result.dmo, 'Healthcare_CarePlan__dlm');
  });

  it('falls back to Text for an unmapped SQL type', async () => {
    const { requestLog } = await runWithColumns({ Id__c: 'VARCHAR', Blob__c: 'GEOGRAPHY' });

    assert.equal(fieldNamed(dmoFields(requestLog[1].body), 'Blob_c').dataType, 'Text');
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
