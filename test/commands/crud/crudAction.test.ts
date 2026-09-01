/**
 * Tier 2: CrudActionCommand integration tests.
 *
 * Tests action commands (run, cancel, retry, etc.) with mocked API.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import TransformRun from '../../../src/commands/data360/transform/run.js';
import TransformValidate from '../../../src/commands/data360/transform/validate.js';

describe('CrudActionCommand', () => {
  describe('transform run', () => {
    it('sends POST to /data-transforms/{name}/actions/run', async () => {
      const { requestLog, result } = await runCommand(TransformRun, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'MyTransform' },
        defaultResponse: {},
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'POST');
      assert.ok(requestLog[0].url.includes('/data-transforms/MyTransform/actions/run'));
      assert.equal(result.success, true);
    });

    it('injects name into endpoint path param', async () => {
      const { requestLog } = await runCommand(TransformRun, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'Special%Transform' },
        defaultResponse: {},
      });

      // Name should be URL-encoded in the path
      assert.ok(requestLog[0].url.includes('Special%25Transform'));
    });
  });

  describe('empty resource id guard', () => {
    it('throws instead of emitting a // path when --name is an empty string', async () => {
      await assert.rejects(
        runCommand(TransformRun, {
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

  describe('transform validate (B21 fix)', () => {
    it('sends POST to /data-transforms/{name}/actions/validate', async () => {
      const { requestLog, result } = await runCommand(TransformValidate, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'MyTransform' },
        defaultResponse: {},
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'POST');
      assert.ok(
        requestLog[0].url.includes('/data-transforms/MyTransform/actions/validate'),
        `Expected validate endpoint, got: ${requestLog[0].url}`
      );
      assert.equal(result.success, true);
    });
  });
});
