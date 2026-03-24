/**
 * Tier 3: connection test — needs name-to-ID resolution.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import ConnectionTest from '../../../src/commands/data360/connection/test.js';

describe('connection test (B14 fix)', () => {
  it('resolves connection name to ID then POSTs test action', async () => {
    const { requestLog, result } = await runCommand(ConnectionTest, {
      flags: {
        'target-org': {},
        'api-version': '66.0',
        timing: false,
        name: 'SalesforceDotCom_Home',
        'connector-type': 'SalesforceDotCom',
      },
      responses: new Map([
        [
          '/connections',
          {
            data: [{ id: '0hMdL000001lCRlUAM', name: 'SalesforceDotCom_Home', connectorType: 'SalesforceDotCom' }],
          },
        ],
        ['/connections/0hMdL000001lCRlUAM/actions/test', {}],
      ]),
    });

    // First: GET list for name resolution
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(requestLog[0].url.includes('/connections'));

    // Second: POST test action with resolved ID
    assert.equal(requestLog[1].method, 'POST');
    assert.ok(
      requestLog[1].url.includes('/connections/0hMdL000001lCRlUAM/actions/test'),
      `Expected resolved ID in path, got: ${requestLog[1].url}`
    );

    assert.equal(result.success, true);
  });
});
