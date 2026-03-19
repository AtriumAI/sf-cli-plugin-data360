/**
 * Tier 2: CrudCreateCommand integration tests.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import SegmentCreate from '../../../src/commands/data360/segment/create.js';

describe('CrudCreateCommand', () => {
  describe('segment create', () => {
    it('sends POST to /segments with definition body', async () => {
      const { requestLog, result } = await runCommand(SegmentCreate, {
        flags: {
          'target-org': {},
          'api-version': '66.0',
          timing: false,
          definitionBody: { name: 'TestSeg', sql: 'SELECT * FROM "ssot__Individual__dlm"' },
        },
        defaultResponse: { id: 'seg123', name: 'TestSeg' },
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'POST');
      assert.ok(requestLog[0].url.includes('/ssot/segments'));
      assert.deepEqual(requestLog[0].body, { name: 'TestSeg', sql: 'SELECT * FROM "ssot__Individual__dlm"' });
      assert.equal(result.success, true);
      assert.equal(result.id, 'seg123');
    });
  });
});
