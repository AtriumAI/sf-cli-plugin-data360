/**
 * Tier 2: CrudUpdateCommand integration tests.
 */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand } from '../../helpers/runCommand.js';

import DmoMappingUpdateField from '../../../src/commands/data360/dmo/mapping-update-field.js';

describe('CrudUpdateCommand', () => {
  describe('dmo mapping-update-field', () => {
    it('PATCHes the field-mappings collection of the named object mapping with the definition body', async () => {
      const definition = {
        sourceEntityDeveloperName: 'Contact_Home__dll',
        targetEntityDeveloperName: 'ssot__Individual__dlm',
        fieldMapping: [{ sourceFieldDeveloperName: 'Phone__c', targetFieldDeveloperName: 'ssot__PhoneNumber__c' }],
      };
      const { requestLog, result } = await runCommand(DmoMappingUpdateField, {
        flags: {
          'target-org': {},
          'api-version': '66.0',
          timing: false,
          name: 'Contact_Home_Individual',
          definitionBody: definition,
        },
        defaultResponse: { developerName: 'Contact_Home_Individual', status: 'UPDATING' },
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'PATCH');
      assert.ok(requestLog[0].url.includes('/ssot/data-model-object-mappings/Contact_Home_Individual/field-mappings'));
      // The endpoint's single path param is filled — no template token survives.
      assert.ok(!requestLog[0].url.includes(':objectSourceTargetMapDeveloperName'));
      assert.deepEqual(requestLog[0].body, definition);
      assert.equal(result.success, true);
    });

    it('declares the --definition-file flag every mutating caller appends', () => {
      // The reported regression: spreading data360Flags made oclif reject
      // --definition-file with "Nonexistent flag" before any HTTP call.
      const flagNames = Object.keys(DmoMappingUpdateField.flags);
      assert.ok(flagNames.includes('definition-file'));
      assert.ok(flagNames.includes('name'));
    });

    it('loads the PATCH body from --definition-file', async () => {
      const definition = {
        sourceEntityDeveloperName: 'Contact_Home__dll',
        targetEntityDeveloperName: 'ssot__Individual__dlm',
        fieldMapping: [{ sourceFieldDeveloperName: 'Phone__c', targetFieldDeveloperName: 'ssot__PhoneNumber__c' }],
      };
      const dir = await mkdtemp(join(tmpdir(), 'data360-'));
      const file = join(dir, 'pairs.json');
      await writeFile(file, JSON.stringify(definition));

      try {
        const { requestLog } = await runCommand(DmoMappingUpdateField, {
          flags: {
            'target-org': {},
            'api-version': '66.0',
            timing: false,
            name: 'Contact_Home_Individual',
            'definition-file': file,
          },
          defaultResponse: { developerName: 'Contact_Home_Individual', status: 'UPDATING' },
        });

        assert.equal(requestLog[0].method, 'PATCH');
        assert.deepEqual(requestLog[0].body, definition);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  });
});
