/**
 * Tier 3: dmo mapping-list — custom query params + nested response parsing.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import DmoMappingList from '../../../src/commands/data360/dmo/mapping-list.js';

describe('dmo mapping-list', () => {
  it('sends correct query params (dloDeveloperName, dmoDeveloperName)', async () => {
    const { requestLog } = await runCommand(DmoMappingList, {
      flags: {
        'target-org': {},
        'api-version': '64.0',
        timing: false,
        source: 'Contact_Home__dll',
        target: 'ssot__Individual__dlm',
      },
      responses: new Map([
        [
          '/data-model-object-mappings',
          {
            objectSourceTargetMaps: [
              {
                sourceEntityDeveloperName: 'Contact_Home__dll',
                targetEntityDeveloperName: 'ssot__Individual__dlm',
                status: 'ACTIVE',
                fieldMappings: [
                  { sourceFieldDeveloperName: 'Id__c', targetFieldDeveloperName: 'ssot__Id__c', developerName: 'fm1' },
                ],
              },
            ],
          },
        ],
      ]),
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(requestLog[0].url.includes('dloDeveloperName=Contact_Home__dll'));
    assert.ok(requestLog[0].url.includes('dmoDeveloperName=ssot__Individual__dlm'));
  });

  it('extracts fieldMappings from nested objectSourceTargetMaps', async () => {
    const { result, tableData } = await runCommand(DmoMappingList, {
      flags: {
        'target-org': {},
        'api-version': '64.0',
        timing: false,
        source: 'Contact_Home__dll',
        target: 'ssot__Individual__dlm',
      },
      responses: new Map([
        [
          '/data-model-object-mappings',
          {
            objectSourceTargetMaps: [
              {
                developerName: 'Contact_Home_Individual',
                sourceEntityDeveloperName: 'Contact_Home__dll',
                targetEntityDeveloperName: 'ssot__Individual__dlm',
                status: 'ACTIVE',
                fieldMappings: [
                  { sourceFieldDeveloperName: 'Id__c', targetFieldDeveloperName: 'ssot__Id__c', developerName: 'fm1' },
                  {
                    sourceFieldDeveloperName: 'Email__c',
                    targetFieldDeveloperName: 'ssot__EmailAddress__c',
                    developerName: 'fm2',
                  },
                  {
                    sourceFieldDeveloperName: 'LastName__c',
                    targetFieldDeveloperName: 'ssot__LastName__c',
                    developerName: 'fm3',
                  },
                ],
              },
            ],
          },
        ],
      ]),
    });

    assert.equal(result.fieldCount, 3);
    assert.equal(result.status, 'ACTIVE');
    assert.equal(result.developerName, 'Contact_Home_Individual');
    assert.equal(tableData.length, 3);

    const first = tableData[0] as Record<string, unknown>;
    assert.equal(first.sourceField, 'Id__c');
    assert.equal(first.targetField, 'ssot__Id__c');
  });

  it('handles no mapping found', async () => {
    const { result, output } = await runCommand(DmoMappingList, {
      flags: {
        'target-org': {},
        'api-version': '64.0',
        timing: false,
        source: 'Missing__dll',
        target: 'ssot__Missing__dlm',
      },
      responses: new Map([['/data-model-object-mappings', { objectSourceTargetMaps: [] }]]),
    });

    assert.equal(result.fieldCount, 0);
    // undefined, not '' — nothing usable as mapping-update-field's --name.
    assert.equal(result.developerName, undefined);
    // The status sentinel stays '' — callers rely on it.
    assert.equal(result.status, '');
    assert.ok(output.some((line) => line.includes('No mapping found')));
  });

  it('reports developerName as undefined when the API omits it from the mapping', async () => {
    const { result } = await runCommand(DmoMappingList, {
      flags: {
        'target-org': {},
        'api-version': '64.0',
        timing: false,
        source: 'Contact_Home__dll',
        target: 'ssot__Individual__dlm',
      },
      responses: new Map([
        [
          '/data-model-object-mappings',
          {
            objectSourceTargetMaps: [
              {
                sourceEntityDeveloperName: 'Contact_Home__dll',
                targetEntityDeveloperName: 'ssot__Individual__dlm',
                status: 'ACTIVE',
                fieldMappings: [],
              },
            ],
          },
        ],
      ]),
    });

    assert.equal(result.developerName, undefined);
    // Distinguishable from "no mapping exists", which reports status ''.
    assert.equal(result.status, 'ACTIVE');
  });
});
