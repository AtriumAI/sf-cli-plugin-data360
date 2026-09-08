/**
 * Tier 3: connection test-definition — tests a definition, not an existing connection.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import ConnectionTestDefinition from '../../../src/commands/data360/connection/test-definition.js';
import ConnectionTestExisting from '../../../src/commands/data360/connection/test-existing.js';

describe('connection test-definition', () => {
  const definition = {
    connectorType: 'AwsRdsPostgres',
    method: 'Ingress',
    credentials: { attributes: [{ name: 'username', value: 'test' }], parameters: { attributes: [] } },
  };

  it('POSTs the connector definition to /connections/actions/test', async () => {
    const { requestLog, result } = await runCommand(ConnectionTestDefinition, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, definitionBody: definition },
      defaultResponse: { success: true, errors: [] },
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'POST');
    assert.ok(requestLog[0].url.endsWith('/ssot/connections/actions/test'), requestLog[0].url);
    assert.deepEqual(requestLog[0].body, definition);
    assert.equal(result.success, true);
  });

  it('leaves connection test-existing on the per-connection path', async () => {
    const { requestLog } = await runCommand(ConnectionTestExisting, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: '0hMdL000001lCRlUAM' },
      defaultResponse: {},
    });

    assert.ok(requestLog[0].url.endsWith('/ssot/connections/0hMdL000001lCRlUAM/actions/test'), requestLog[0].url);
  });
});
