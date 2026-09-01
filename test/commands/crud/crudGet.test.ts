/**
 * Tier 2: CrudGetCommand integration tests.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import DmoGet from '../../../src/commands/data360/dmo/get.js';
import TransformGet from '../../../src/commands/data360/transform/get.js';

describe('CrudGetCommand', () => {
  describe('dmo get', () => {
    it('sends GET to /data-model-objects/{name}', async () => {
      const { requestLog } = await runCommand(DmoGet, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'ssot__Individual__dlm' },
        defaultResponse: { name: 'ssot__Individual__dlm', label: 'Individual', fields: [] },
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'GET');
      assert.ok(requestLog[0].url.includes('/data-model-objects/ssot__Individual__dlm'));
    });
  });

  describe('empty resource id guard', () => {
    it('throws instead of emitting a // path when --name is an empty string', async () => {
      await assert.rejects(
        runCommand(DmoGet, {
          flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: '' },
          defaultResponse: {},
        }),
        (err: Error) => {
          assert.match(err.message, /non-empty resource name is required/);
          assert.equal(err.name, 'DATA360_MISSING_RESOURCE_ID');
          return true;
        }
      );
    });
  });

  describe('transform get', () => {
    it('maps response fields correctly', async () => {
      const { tableData } = await runCommand(TransformGet, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'MyTransform' },
        defaultResponse: {
          name: 'MyTransform',
          label: 'My Transform',
          type: 'Standard',
          status: 'ACTIVE',
          lastRunStatus: 'SUCCESS',
          lastRunDate: '2026-03-18',
          createdBy: { name: 'Admin' },
          lastModifiedDate: '2026-03-18',
        },
      });

      assert.equal(tableData.length, 1);
      const row = tableData[0] as Record<string, unknown>;
      assert.equal(row.name, 'MyTransform');
      assert.equal(row.status, 'ACTIVE');
      assert.equal(row.createdBy, 'Admin');
    });
  });
});
