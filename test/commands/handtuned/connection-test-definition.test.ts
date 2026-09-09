/**
 * Tier 3: connection test-definition — tests a definition, not an existing connection.
 */
import assert from 'node:assert/strict';
import { SfError } from '@salesforce/core';
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

  it('fails when the API reports success: false rather than exiting 0', async () => {
    await assert.rejects(
      runCommand(ConnectionTestDefinition, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, definitionBody: definition },
        defaultResponse: { success: false, errors: [{ errorCode: 'AUTH_FAILED', message: 'bad credentials' }] },
      }),
      (err: SfError) => {
        assert.equal(err.name, 'DATA360_CONNECTION_TEST_FAILED');
        // The response travels on the error, so --json still reports the errors.
        assert.deepEqual((err.data as { errors: unknown[] }).errors.length, 1);
        return true;
      }
    );
  });

  it('emits the raw response before failing, so --raw still shows the errors', async () => {
    const logged: string[] = [];
    await assert.rejects(
      runCommand(ConnectionTestDefinition, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, raw: true, definitionBody: definition },
        defaultResponse: { success: false, errors: [{ errorCode: 'AUTH_FAILED' }] },
        onLog: (line) => logged.push(line),
      }),
      (err: SfError) => {
        assert.equal(err.name, 'DATA360_CONNECTION_TEST_FAILED');
        return true;
      }
    );

    assert.ok(logged.join('\n').includes('AUTH_FAILED'), logged.join('\n'));
  });

  it('leaves connection test-existing on the per-connection path', async () => {
    const { requestLog } = await runCommand(ConnectionTestExisting, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: '0hMdL000001lCRlUAM' },
      defaultResponse: {},
    });

    assert.ok(requestLog[0].url.endsWith('/ssot/connections/0hMdL000001lCRlUAM/actions/test'), requestLog[0].url);
  });
});
