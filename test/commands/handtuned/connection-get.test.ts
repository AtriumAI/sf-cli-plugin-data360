/**
 * Tier 3: connection get — name resolution with connectorType requirement.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import ConnectionGet from '../../../src/commands/data360/connection/get.js';

describe('connection get (B15 fix)', () => {
  it('resolves connection name to ID via list endpoint with connectorType', async () => {
    const { requestLog, result } = await runCommand(ConnectionGet, {
      flags: {
        'target-org': {},
        'api-version': '66.0',
        timing: false,
        name: 'SalesforceDotCom_Home',
        'connector-type': 'SalesforceDotCom',
      },
      responses: new Map([
        // List endpoint (with connectorType in URL)
        [
          '/connections',
          {
            data: [
              {
                id: '0hMdL000001lCRlUAM',
                name: 'SalesforceDotCom_Home',
                connectorType: 'SalesforceDotCom',
                label: 'SF CRM Home',
              },
            ],
          },
        ],
        // Get endpoint with resolved ID
        [
          '/connections/0hMdL000001lCRlUAM',
          {
            id: '0hMdL000001lCRlUAM',
            name: 'SalesforceDotCom_Home',
            connectorType: 'SalesforceDotCom',
            status: 'ACTIVE',
            label: 'Salesforce Connector Home',
          },
        ],
      ]),
    });

    // First: GET list for name resolution (includes connectorType)
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(requestLog[0].url.includes('connectorType=SalesforceDotCom'));

    // Second: GET connection detail with resolved ID
    assert.equal(requestLog[1].method, 'GET');
    assert.ok(requestLog[1].url.includes('/connections/0hMdL000001lCRlUAM'));

    assert.equal(result.data.name, 'SalesforceDotCom_Home');
  });
});
