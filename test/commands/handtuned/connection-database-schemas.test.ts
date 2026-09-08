/**
 * Tier 3: connection database-schemas — POST-only read whose array holds bare strings.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import ConnectionDatabaseSchemas from '../../../src/commands/data360/connection/database-schemas.js';

const flags = { 'target-org': {}, 'api-version': '66.0', timing: false, all: false, name: '0hMdL000001lCRlUAM' };

const schemasResponse = { schemas: ['testSchema', 'testSchema2'] };

describe('connection database-schemas', () => {
  it('POSTs the minimal body instead of the GET the endpoint rejects', async () => {
    const { requestLog } = await runCommand(ConnectionDatabaseSchemas, {
      flags,
      defaultResponse: schemasResponse,
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'POST');
    assert.deepEqual(requestLog[0].body, { advancedAttributes: {} });
    assert.equal(requestLog[0].url, '/services/data/v66.0/ssot/connections/0hMdL000001lCRlUAM/database-schemas');
  });

  it('sends no pagination params, which a POST-read endpoint does not accept', async () => {
    const { requestLog } = await runCommand(ConnectionDatabaseSchemas, {
      flags,
      defaultResponse: schemasResponse,
    });

    for (const param of ['batchSize', 'limit', 'offset']) {
      assert.ok(!requestLog[0].url.includes(param), `must not send ${param}: ${requestLog[0].url}`);
    }
  });

  it('maps each bare schema name onto the column key the table renders', async () => {
    const { result, tableData } = await runCommand(ConnectionDatabaseSchemas, {
      flags,
      responses: new Map<string, unknown>([['/database-schemas', schemasResponse]]),
    });

    // Without mapRecord the rows would be strings and every cell would render blank.
    assert.deepEqual(result.data, [{ name: 'testSchema' }, { name: 'testSchema2' }]);
    assert.deepEqual(tableData, [{ name: 'testSchema' }, { name: 'testSchema2' }]);
  });

  it('warns that --all is inert rather than silently ignoring it', async () => {
    const { warnings, requestLog } = await runCommand(ConnectionDatabaseSchemas, {
      flags: { ...flags, all: true },
      defaultResponse: schemasResponse,
    });

    assert.equal(requestLog.length, 1);
    assert.ok(
      warnings.some((w) => w.includes('--all has no effect')),
      `expected an --all warning, got ${JSON.stringify(warnings)}`
    );
  });

  it('--raw emits the response array untouched, bypassing the name mapping', async () => {
    const { output } = await runCommand(ConnectionDatabaseSchemas, {
      flags: { ...flags, raw: true },
      responses: new Map<string, unknown>([['/database-schemas', schemasResponse]]),
    });

    assert.deepEqual(JSON.parse(output.join('\n')), ['testSchema', 'testSchema2']);
  });

  it('yields no rows when the response omits schemas, rather than picking a sibling array', async () => {
    const { result, output } = await runCommand(ConnectionDatabaseSchemas, {
      flags,
      responses: new Map<string, unknown>([
        // A shape lacking `schemas`: the pre-strict fallback would have returned `databases`.
        ['/database-schemas', { databases: ['testdb'] }],
      ]),
    });

    assert.deepEqual(result.data, []);
    assert.ok(output.includes('No results.'));
  });
});
