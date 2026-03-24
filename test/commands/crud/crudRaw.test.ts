/**
 * Tier 2: --raw flag for CrudGetCommand and CrudListCommand.
 * When --raw is set, print the full JSON response without mapping.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import DmoGet from '../../../src/commands/data360/dmo/get.js';
import SegmentList from '../../../src/commands/data360/segment/list.js';

describe('--raw flag (E13)', () => {
  describe('CrudGetCommand with --raw', () => {
    it('outputs full JSON response without column mapping', async () => {
      const fullResponse = {
        name: 'ssot__Individual__dlm',
        label: 'Individual',
        category: 'Profile',
        fields: [
          { name: 'ssot__Id__c', type: 'Text' },
          { name: 'ssot__FirstName__c', type: 'Text' },
        ],
        isSegmentable: true,
        dataSpaceName: 'default',
        someDeepField: { nested: true },
      };

      const { output, tableData } = await runCommand(DmoGet, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'ssot__Individual__dlm', raw: true },
        defaultResponse: fullResponse,
      });

      // With --raw, should NOT use table output
      assert.equal(tableData.length, 0, 'Should not produce table output with --raw');

      // Should output raw JSON
      const jsonOutput = output.join('\n');
      assert.ok(jsonOutput.includes('someDeepField'), 'Raw output should include full response');
      assert.ok(jsonOutput.includes('nested'), 'Raw output should include nested fields');
    });
  });

  describe('CrudListCommand with --raw', () => {
    it('outputs full JSON response without column mapping', async () => {
      const fullResponse = {
        segments: [{ apiName: 'Seg1', displayName: 'Segment One', internalField: 'hidden_normally' }],
      };

      const { output, tableData } = await runCommand(SegmentList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: false, raw: true },
        responses: new Map([['/segments', fullResponse]]),
      });

      assert.equal(tableData.length, 0, 'Should not produce table output with --raw');

      const jsonOutput = output.join('\n');
      assert.ok(jsonOutput.includes('internalField'), 'Raw output should include unmapped fields');
    });
  });
});
