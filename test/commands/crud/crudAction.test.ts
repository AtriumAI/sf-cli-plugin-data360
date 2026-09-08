/**
 * Tier 2: CrudActionCommand integration tests.
 *
 * Tests action commands (run, cancel, retry, etc.) with mocked API.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand } from '../../helpers/runCommand.js';
import { CrudActionCommand } from '../../../src/shared/data360/crudBase.js';

import TransformRun from '../../../src/commands/data360/transform/run.js';
import TransformValidate from '../../../src/commands/data360/transform/validate.js';

class ActionCommand extends CrudActionCommand {
  protected readonly endpoint = '/widgets/actions/check';
}

class ActionWithQuery extends CrudActionCommand {
  protected readonly endpoint = '/widgets/actions/check';

  // eslint-disable-next-line class-methods-use-this
  protected queryParams(flags: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
    return { threshold: flags.threshold as string | undefined };
  }
}

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
  describe('definition body and query params', () => {
    const baseFlags = { 'target-org': {}, 'api-version': '66.0', timing: false };

    it('posts the definition body', async () => {
      const { requestLog } = await runCommand(ActionCommand, {
        flags: { ...baseFlags, definitionBody: { mlModel: 'm', files: [] } },
        defaultResponse: {},
      });

      assert.deepEqual(requestLog[0].body, { mlModel: 'm', files: [] });
    });

    it('posts an empty body when no definition was given', async () => {
      const { requestLog } = await runCommand(ActionCommand, { flags: baseFlags, defaultResponse: {} });

      assert.deepEqual(requestLog[0].body, {});
    });

    it('loads --definition-file from disk', async () => {
      const file = join(mkdtempSync(join(tmpdir(), 'data360-action-')), 'body.json');
      writeFileSync(file, JSON.stringify({ mode: 'Single' }));

      const { requestLog } = await runCommand(ActionCommand, {
        flags: { ...baseFlags, 'definition-file': file },
        defaultResponse: {},
      });

      assert.deepEqual(requestLog[0].body, { mode: 'Single' });
    });

    it('appends queryParams to the path', async () => {
      const { requestLog } = await runCommand(ActionWithQuery, {
        flags: { ...baseFlags, threshold: '0.9' },
        defaultResponse: {},
      });

      assert.ok(requestLog[0].url.endsWith('/widgets/actions/check?threshold=0.9'), requestLog[0].url);
    });

    it('omits an unset query param entirely', async () => {
      const { requestLog } = await runCommand(ActionWithQuery, { flags: baseFlags, defaultResponse: {} });

      assert.ok(!requestLog[0].url.includes('?'), requestLog[0].url);
    });
  });
});
