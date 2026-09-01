/**
 * Tier 2: CrudUpdateCommand integration tests.
 */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { runCommand } from '../../helpers/runCommand.js';
import { mutationFlags } from '../../../src/shared/data360/crudBase.js';

import DmoMappingUpdateField from '../../../src/commands/data360/dmo/mapping-update-field.js';

// Mirrors the command's pinned --api-version default, so the expected URL below stays exact.
const API_VERSION = '64.0';
const EXPECTED_PATH = `/services/data/v${API_VERSION}/ssot/data-model-object-mappings/Contact_Home_Individual/field-mappings`;

describe('CrudUpdateCommand', () => {
  describe('dmo mapping-update-field', () => {
    it('PATCHes the field-mappings collection of the named object mapping with the definition body', async () => {
      const definition = {
        sourceEntityDeveloperName: 'Contact_Home__dll',
        targetEntityDeveloperName: 'ssot__Individual__dlm',
        fieldMapping: [{ sourceFieldDeveloperName: 'Phone__c', targetFieldDeveloperName: 'ssot__PhoneNumber__c' }],
      };
      const { requestLog, result } = await runCommand(DmoMappingUpdateField, {
        apiVersion: API_VERSION,
        flags: {
          'target-org': {},
          'api-version': API_VERSION,
          timing: false,
          name: 'Contact_Home_Individual',
          definitionBody: definition,
        },
        defaultResponse: { developerName: 'Contact_Home_Individual', status: 'UPDATING' },
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'PATCH');
      // Exact equality — a prefix check would also pass against the old
      // .../field-mappings/:fieldSourceTargetMapDeveloperName endpoint.
      assert.equal(requestLog[0].url, EXPECTED_PATH);
      assert.deepEqual(requestLog[0].body, definition);
      assert.equal(result.success, true);
    });

    it('pins --api-version to 64.0, matching mapping-list', () => {
      assert.equal(DmoMappingUpdateField.flags['api-version'].default, API_VERSION);
    });

    it('declares the --definition-file flag every mutating caller appends, and requires it', () => {
      // The reported regression: spreading data360Flags made oclif reject
      // --definition-file with "Nonexistent flag" before any HTTP call.
      const flagNames = Object.keys(DmoMappingUpdateField.flags);
      assert.ok(flagNames.includes('definition-file'));
      assert.ok(flagNames.includes('name'));
      // Without a body the PATCH would send {} and still report success.
      assert.equal(DmoMappingUpdateField.flags['definition-file'].required, true);
      // Required for this command only — other mutating commands may omit it.
      assert.notEqual(mutationFlags['definition-file'].required, true);
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
          apiVersion: API_VERSION,
          flags: {
            'target-org': {},
            'api-version': API_VERSION,
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

    it('loads the PATCH body from stdin when --definition-file is "-"', async () => {
      const definition = {
        sourceEntityDeveloperName: 'Contact_Home__dll',
        targetEntityDeveloperName: 'ssot__Individual__dlm',
        fieldMapping: [{ sourceFieldDeveloperName: 'Phone__c', targetFieldDeveloperName: 'ssot__PhoneNumber__c' }],
      };
      // readStdin used to setEncoding('utf-8'), so 'data' emitted strings and
      // Buffer.concat threw ERR_INVALID_ARG_TYPE inside the 'end' listener —
      // an uncaught crash, not a catchable SfError.
      const fakeStdin = new PassThrough();
      fakeStdin.end(JSON.stringify(definition));
      const realStdin = Object.getOwnPropertyDescriptor(process, 'stdin');
      Object.defineProperty(process, 'stdin', { configurable: true, value: fakeStdin });

      try {
        const { requestLog } = await runCommand(DmoMappingUpdateField, {
          apiVersion: API_VERSION,
          flags: {
            'target-org': {},
            'api-version': API_VERSION,
            timing: false,
            name: 'Contact_Home_Individual',
            'definition-file': '-',
          },
          defaultResponse: { developerName: 'Contact_Home_Individual', status: 'UPDATING' },
        });

        assert.equal(requestLog[0].method, 'PATCH');
        assert.deepEqual(requestLog[0].body, definition);
      } finally {
        if (realStdin) Object.defineProperty(process, 'stdin', realStdin);
      }
    });
  });

  describe('empty resource id guard', () => {
    it('throws instead of emitting a // path when --name is an empty string', async () => {
      // oclif's required:true accepts '', so the guard in CrudUpdateCommand.run is reachable.
      await assert.rejects(
        runCommand(DmoMappingUpdateField, {
          apiVersion: API_VERSION,
          flags: {
            'target-org': {},
            'api-version': API_VERSION,
            timing: false,
            name: '',
            definitionBody: { fieldMapping: [] },
          },
          defaultResponse: {},
        }),
        (err: Error) => {
          assert.match(err.message, /non-empty resource name is required/);
          assert.equal(err.name, 'DATA360_MISSING_RESOURCE_ID');
          return true;
        }
      );
    });

    it('does not fire for a valid resource id', async () => {
      const { requestLog } = await runCommand(DmoMappingUpdateField, {
        apiVersion: API_VERSION,
        flags: {
          'target-org': {},
          'api-version': API_VERSION,
          timing: false,
          name: 'Contact_Home_Individual',
          definitionBody: { fieldMapping: [] },
        },
        defaultResponse: {},
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].url, EXPECTED_PATH);
    });
  });
});
