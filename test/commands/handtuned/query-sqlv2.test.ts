/**
 * Tier 3: query sqlv2 — POST SQL query with pagination support.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import QuerySqlv2 from '../../../src/commands/data360/query/sqlv2.js';

describe('query sqlv2 (B17 fix)', () => {
  it('sends POST to /queryv2 with SQL body', async () => {
    const { requestLog, result } = await runCommand(QuerySqlv2, {
      flags: {
        'target-org': {},
        'api-version': '66.0',
        timing: false,
        sql: 'SELECT * FROM "ssot__Individual__dlm" LIMIT 5',
      },
      responses: new Map([
        [
          '/queryv2',
          {
            data: [{ ssot__Id__c: 'id1', ssot__FirstName__c: 'Chris' }],
            metadata: {
              ssot__Id__c: { type: 'VARCHAR', placeInOrder: 0 },
              ssot__FirstName__c: { type: 'VARCHAR', placeInOrder: 1 },
            },
          },
        ],
      ]),
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'POST');
    assert.ok(requestLog[0].url.includes('/queryv2'));
    assert.deepEqual(requestLog[0].body, { sql: 'SELECT * FROM "ssot__Individual__dlm" LIMIT 5' });
    assert.equal(result.rowCount, 1);
    assert.equal(result.nextBatchId, undefined);
  });

  it('returns nextBatchId when more results available', async () => {
    const { result, output } = await runCommand(QuerySqlv2, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, sql: 'SELECT * FROM "ssot__Individual__dlm"' },
      responses: new Map([
        [
          '/queryv2',
          {
            data: [{ id: '1' }, { id: '2' }],
            metadata: { id: { type: 'VARCHAR', placeInOrder: 0 } },
            nextBatchId: 'batch-abc-123',
          },
        ],
      ]),
    });

    assert.equal(result.nextBatchId, 'batch-abc-123');
    assert.ok(
      output.some((line) => line.includes('batch-abc-123')),
      'Should show next batch hint'
    );
  });

  it('handles empty results', async () => {
    const { result, output } = await runCommand(QuerySqlv2, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, sql: 'SELECT * FROM "Empty__dlm"' },
      responses: new Map([['/queryv2', { data: [], metadata: {} }]]),
    });

    assert.equal(result.rowCount, 0);
    assert.ok(output.some((line) => line.includes('No results')));
  });
});
