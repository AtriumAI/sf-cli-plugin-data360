/**
 * Tier 3: connection schema-get — needs to parse schemas[].fields[].
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import SchemaGet from '../../../src/commands/data360/connection/schema-get.js';

describe('connection schema-get (B26 fix)', () => {
  it('displays schema objects with field counts', async () => {
    const { tableData } = await runCommand(SchemaGet, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: '1WMKj000000CmlXOAS' },
      responses: new Map([
        [
          '/connections/1WMKj000000CmlXOAS/schema',
          {
            schemas: [
              {
                name: 'Badge_Scan',
                label: 'Badge_Scan',
                availabilityStatus: 'Available',
                fields: [
                  { name: 'ScanId', label: 'ScanId', dataType: 'Text' },
                  { name: 'EventId', label: 'EventId', dataType: 'Text' },
                  { name: 'Room', label: 'Room', dataType: 'Text' },
                ],
              },
            ],
          },
        ],
      ]),
    });

    assert.equal(tableData.length, 1);
    const row = tableData[0] as Record<string, unknown>;
    assert.equal(row.name, 'Badge_Scan');
    assert.equal(row.status, 'Available');
    assert.equal(row.fieldCount, 3);
  });

  it('handles multiple schemas', async () => {
    const { tableData } = await runCommand(SchemaGet, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'test-id' },
      responses: new Map([
        [
          '/connections/test-id/schema',
          {
            schemas: [
              { name: 'Object_A', label: 'Object A', availabilityStatus: 'Available', fields: [{ name: 'f1' }] },
              {
                name: 'Object_B',
                label: 'Object B',
                availabilityStatus: 'Available',
                fields: [{ name: 'f1' }, { name: 'f2' }],
              },
            ],
          },
        ],
      ]),
    });

    assert.equal(tableData.length, 2);
    assert.equal((tableData[0] as Record<string, unknown>).fieldCount, 1);
    assert.equal((tableData[1] as Record<string, unknown>).fieldCount, 2);
  });
});
