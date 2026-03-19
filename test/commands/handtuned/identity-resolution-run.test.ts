/**
 * Tier 3: identity-resolution run — name-to-ID resolution + POST action.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import IdentityResolutionRun from '../../../src/commands/data360/identity-resolution/run.js';

describe('identity-resolution run (B7 fix)', () => {
  it('resolves label to ID then POSTs to run-now endpoint', async () => {
    const { requestLog, result } = await runCommand(IdentityResolutionRun, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'Main' },
      responses: new Map([
        // Name resolution: list endpoint returns records with id + label
        [
          '/identity-resolutions',
          {
            data: [
              { id: '1irdL00000094cgQAA', label: 'Main', rulesetId: 'wksp', rulesetStatus: 'PUBLISHED' },
              { id: '1irdL000000935GQAQ', label: 'Individual Match', rulesetStatus: 'PUBLISHED' },
            ],
          },
        ],
        // Run endpoint
        ['/identity-resolutions/1irdL00000094cgQAA/actions/run-now', {}],
      ]),
    });

    // First request: GET list for name resolution
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(requestLog[0].url.includes('/identity-resolutions'));

    // Second request: POST to run-now with resolved ID
    assert.equal(requestLog[1].method, 'POST');
    assert.ok(
      requestLog[1].url.includes('/identity-resolutions/1irdL00000094cgQAA/actions/run-now'),
      `Expected resolved ID in path, got: ${requestLog[1].url}`
    );

    assert.equal(result.success, true);
    assert.equal(result.id, '1irdL00000094cgQAA');
  });

  it('skips resolution when given an 18-char ID directly', async () => {
    const { requestLog } = await runCommand(IdentityResolutionRun, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: '1irdL00000094cgQAA' },
      defaultResponse: {},
    });

    // Should NOT call the list endpoint — goes straight to run-now
    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'POST');
    assert.ok(requestLog[0].url.includes('1irdL00000094cgQAA'));
  });

  it('throws when name cannot be resolved', async () => {
    await assert.rejects(
      () =>
        runCommand(IdentityResolutionRun, {
          flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'NonExistent' },
          responses: new Map([['/identity-resolutions', { data: [{ id: 'abc', label: 'Main' }] }]]),
        }),
      (err: Error) => err.message.includes('Could not resolve')
    );
  });
});
