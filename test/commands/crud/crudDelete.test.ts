/**
 * Tier 2: CrudDeleteCommand integration tests.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import DataStreamDelete from '../../../src/commands/data360/data-stream/delete.js';
import SegmentDelete from '../../../src/commands/data360/segment/delete.js';

describe('CrudDeleteCommand', () => {
  describe('data-stream delete (B2 fix)', () => {
    it('sends DELETE with shouldDeleteDataLakeObject=true by default', async () => {
      const { requestLog, result } = await runCommand(DataStreamDelete, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'Account_Home', 'keep-dlo': false },
        defaultResponse: {},
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'DELETE');
      assert.ok(requestLog[0].url.includes('/data-streams/Account_Home'));
      assert.ok(requestLog[0].url.includes('shouldDeleteDataLakeObject=true'));
      assert.equal(result.success, true);
    });

    it('sends shouldDeleteDataLakeObject=false with --keep-dlo', async () => {
      const { requestLog } = await runCommand(DataStreamDelete, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'Account_Home', 'keep-dlo': true },
        defaultResponse: {},
      });

      assert.ok(requestLog[0].url.includes('shouldDeleteDataLakeObject=false'));
    });
  });

  describe('segment delete', () => {
    it('sends DELETE to /segments/{name}', async () => {
      const { requestLog, result } = await runCommand(SegmentDelete, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'My_Segment' },
        defaultResponse: {},
      });

      assert.equal(requestLog[0].method, 'DELETE');
      assert.ok(requestLog[0].url.includes('/segments/My_Segment'));
      assert.equal(result.success, true);
    });
  });

  describe('empty resource id guard', () => {
    it('throws instead of sending DELETE /segments//', async () => {
      await assert.rejects(
        runCommand(SegmentDelete, {
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
});
