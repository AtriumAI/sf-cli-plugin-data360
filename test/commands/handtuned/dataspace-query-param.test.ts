/**
 * Tier 3: --dataspace is sent as a query parameter on every command the live
 * API was verified to honor it on.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

import DmoMappingGet from '../../../src/commands/data360/dmo/mapping-get.js';
import DmoMappingList from '../../../src/commands/data360/dmo/mapping-list.js';
import DmoRelationshipList from '../../../src/commands/data360/dmo/relationship-list.js';
import DmoMappingCreate from '../../../src/commands/data360/dmo/mapping-create.js';
import DmoRelationshipCreate from '../../../src/commands/data360/dmo/relationship-create.js';
import DmoRelationshipDelete from '../../../src/commands/data360/dmo/relationship-delete.js';
import SegmentList from '../../../src/commands/data360/segment/list.js';
import SegmentCreate from '../../../src/commands/data360/segment/create.js';
import DataActionList from '../../../src/commands/data360/data-action/list.js';
import CalculatedInsightList from '../../../src/commands/data360/calculated-insight/list.js';
import DataGraphMetadata from '../../../src/commands/data360/data-graph/metadata.js';
import MetadataGet from '../../../src/commands/data360/metadata/get.js';

const base = { 'target-org': {}, 'api-version': '66.0', timing: false };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cmd = new (...args: any[]) => never;

const wired: Array<{ name: string; cmd: unknown; flags: Record<string, unknown>; response?: unknown }> = [
  { name: 'dmo mapping-get', cmd: DmoMappingGet, flags: { name: 'Account_map_1' } },
  { name: 'dmo mapping-list', cmd: DmoMappingList, flags: { source: 'A__dll', target: 'B__dlm' } },
  { name: 'dmo relationship-list', cmd: DmoRelationshipList, flags: { name: 'ssot__Account__dlm' } },
  { name: 'dmo mapping-create', cmd: DmoMappingCreate, flags: { definitionBody: { a: 1 } } },
  { name: 'dmo relationship-create', cmd: DmoRelationshipCreate, flags: { name: 'ssot__Account__dlm' } },
  { name: 'dmo relationship-delete', cmd: DmoRelationshipDelete, flags: { name: 'RelX' } },
  { name: 'segment list', cmd: SegmentList, flags: {} },
  { name: 'segment create', cmd: SegmentCreate, flags: { definitionBody: { a: 1 } } },
  { name: 'data-action list', cmd: DataActionList, flags: {} },
  { name: 'calculated-insight list', cmd: CalculatedInsightList, flags: {} },
  { name: 'data-graph metadata', cmd: DataGraphMetadata, flags: {} },
  { name: 'metadata get', cmd: MetadataGet, flags: {} },
];

describe('--dataspace query parameter', () => {
  for (const { name, cmd, flags } of wired) {
    it(`${name} sends dataspace in the query string`, async () => {
      const { requestLog } = await runCommand(cmd as Cmd, {
        flags: { ...base, ...flags, dataspace: 'Marketing' },
        defaultResponse: {},
      });

      assert.ok(requestLog.length >= 1, 'no request was made');
      assert.ok(requestLog[0].url.includes('dataspace=Marketing'), requestLog[0].url);
    });

    it(`${name} declares dataspace defaulting to "default"`, () => {
      const declared = (cmd as { flags: Record<string, { default?: unknown }> }).flags;
      assert.equal(declared.dataspace.default, 'default');
    });
  }

  it('dmo mapping-list keeps its DLO and DMO params alongside dataspace', async () => {
    const { requestLog } = await runCommand(DmoMappingList, {
      flags: { ...base, source: 'Contact_Home__dll', target: 'ssot__Individual__dlm', dataspace: 'Marketing' },
      defaultResponse: { objectSourceTargetMaps: [] },
    });

    const { url } = requestLog[0];
    assert.ok(url.includes('dloDeveloperName=Contact_Home__dll'), url);
    assert.ok(url.includes('dmoDeveloperName=ssot__Individual__dlm'), url);
    assert.ok(url.includes('dataspace=Marketing'), url);
  });

  it('dmo relationship-delete sends dataspace on the DELETE', async () => {
    const { requestLog } = await runCommand(DmoRelationshipDelete, {
      flags: { ...base, name: 'RelX', dataspace: 'Marketing' },
      defaultResponse: {},
    });

    assert.equal(requestLog[0].method, 'DELETE');
    assert.ok(
      requestLog[0].url.endsWith('/data-model-objects/relationships/RelX?dataspace=Marketing'),
      requestLog[0].url
    );
  });

  it('dmo mapping-create POSTs the body with dataspace on the URL', async () => {
    const { requestLog } = await runCommand(DmoMappingCreate, {
      flags: { ...base, definitionBody: { sourceEntityDeveloperName: 'A__dll' }, dataspace: 'Marketing' },
      defaultResponse: {},
    });

    assert.equal(requestLog[0].method, 'POST');
    assert.deepEqual(requestLog[0].body, { sourceEntityDeveloperName: 'A__dll' });
    assert.ok(requestLog[0].url.endsWith('/data-model-object-mappings?dataspace=Marketing'), requestLog[0].url);
  });
});
