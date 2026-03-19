/**
 * Tier 3: async query lifecycle — create, status, rows, cancel.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import AsyncCreate from '../../../src/commands/data360/query/async-create.js';
import AsyncStatus from '../../../src/commands/data360/query/async-status.js';
import AsyncRows from '../../../src/commands/data360/query/async-rows.js';
import AsyncCancel from '../../../src/commands/data360/query/async-cancel.js';

describe('query async commands (B17 fix)', () => {
  describe('async-create', () => {
    it('sends POST to /query-sql with SQL body', async () => {
      const { requestLog, result } = await runCommand(AsyncCreate, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, sql: 'SELECT * FROM "ssot__Individual__dlm"' },
        responses: new Map([['/query-sql', { queryId: 'qry-001', status: 'SUBMITTED' }]]),
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'POST');
      assert.ok(requestLog[0].url.includes('/query-sql'));
      assert.deepEqual(requestLog[0].body, { sql: 'SELECT * FROM "ssot__Individual__dlm"' });
      assert.equal(result.queryId, 'qry-001');
      assert.equal(result.status, 'SUBMITTED');
    });
  });

  describe('async-status', () => {
    it('sends GET to /query-sql/{queryId}', async () => {
      const { requestLog, result } = await runCommand(AsyncStatus, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, 'query-id': 'qry-001' },
        responses: new Map([
          ['/query-sql/qry-001', { queryId: 'qry-001', status: 'COMPLETED', rowCount: 500, createdDate: '2026-03-18' }],
        ]),
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'GET');
      assert.ok(requestLog[0].url.includes('/query-sql/qry-001'));
      assert.equal(result.status, 'COMPLETED');
    });
  });

  describe('async-rows', () => {
    it('sends GET to /query-sql/{queryId}/rows and formats results', async () => {
      const { requestLog, result, tableData } = await runCommand(AsyncRows, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, 'query-id': 'qry-001' },
        responses: new Map([
          [
            '/query-sql/qry-001/rows',
            {
              data: [{ col1: 'a' }, { col1: 'b' }],
              metadata: { col1: { type: 'VARCHAR', placeInOrder: 0 } },
            },
          ],
        ]),
      });

      assert.equal(requestLog[0].method, 'GET');
      assert.ok(requestLog[0].url.includes('/query-sql/qry-001/rows'));
      assert.equal(result.rowCount, 2);
      assert.equal(tableData.length, 2);
    });
  });

  describe('async-cancel', () => {
    it('sends DELETE to /query-sql/{queryId}', async () => {
      const { requestLog, result } = await runCommand(AsyncCancel, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, 'query-id': 'qry-001' },
        defaultResponse: {},
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'DELETE');
      assert.ok(requestLog[0].url.includes('/query-sql/qry-001'));
      assert.equal(result.success, true);
    });
  });
});
