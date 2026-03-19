/**
 * Tier 2: CrudListCommand integration tests.
 *
 * Tests the shared list logic using real command subclasses with mocked API.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';

// Import actual commands as test subjects
import SegmentList from '../../../src/commands/data360/segment/list.js';
import DmoList from '../../../src/commands/data360/dmo/list.js';
import IdentityResolutionList from '../../../src/commands/data360/identity-resolution/list.js';

describe('CrudListCommand', () => {
  describe('segment list', () => {
    it('sends GET to /segments with pagination params', async () => {
      const { requestLog, result } = await runCommand(SegmentList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: false },
        responses: new Map([
          [
            '/segments',
            {
              segments: [
                {
                  apiName: 'Seg1',
                  displayName: 'Segment One',
                  segmentStatus: 'ACTIVE',
                  segmentType: 'DBT',
                  publishStatus: 'SUCCESS',
                  lastSegmentMemberCount: 42,
                },
              ],
            },
          ],
        ]),
      });

      assert.equal(requestLog.length, 1);
      assert.equal(requestLog[0].method, 'GET');
      assert.ok(requestLog[0].url.includes('/ssot/segments'));
      assert.ok(requestLog[0].url.includes('batchSize='));
      assert.equal(result.data.length, 1);
      assert.equal(result.totalSize, 1);
    });

    it('uses arrayKey "segments" to extract data', async () => {
      const { result, tableData } = await runCommand(SegmentList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: false },
        responses: new Map([
          [
            '/segments',
            {
              segments: [
                {
                  apiName: 'A',
                  displayName: 'AA',
                  segmentStatus: 'ACTIVE',
                  segmentType: 'UI',
                  publishStatus: 'DRAFT',
                  lastSegmentMemberCount: 0,
                },
                {
                  apiName: 'B',
                  displayName: 'BB',
                  segmentStatus: 'ACTIVE',
                  segmentType: 'DBT',
                  publishStatus: 'SUCCESS',
                  lastSegmentMemberCount: 100,
                },
              ],
            },
          ],
        ]),
      });

      assert.equal(result.data.length, 2);
      assert.equal(tableData.length, 2);
    });
  });

  describe('dmo list', () => {
    it('uses batchSize=50 for DMO API', async () => {
      const { requestLog } = await runCommand(DmoList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: false },
        responses: new Map([
          [
            '/data-model-objects',
            {
              data: [
                {
                  name: 'ssot__Individual__dlm',
                  label: 'Individual',
                  category: 'Profile',
                  fields: [{}, {}],
                  isSegmentable: true,
                  dataSpaceName: 'default',
                },
              ],
            },
          ],
        ]),
      });

      assert.equal(requestLog.length, 1);
      assert.ok(requestLog[0].url.includes('batchSize=50'), `Expected batchSize=50, got: ${requestLog[0].url}`);
    });

    it('mapRecord counts fields and formats segmentable', async () => {
      const { tableData } = await runCommand(DmoList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: false },
        responses: new Map([
          [
            '/data-model-objects',
            {
              data: [
                {
                  name: 'ssot__Individual__dlm',
                  label: 'Individual',
                  category: 'Profile',
                  fields: [{}, {}, {}],
                  isSegmentable: true,
                  dataSpaceName: 'default',
                },
              ],
            },
          ],
        ]),
      });

      const row = tableData[0] as Record<string, unknown>;
      assert.equal(row.fieldCount, 3);
      assert.equal(row.segmentable, 'Yes');
    });

    it('paginates with --all flag', async () => {
      const { result } = await runCommand(DmoList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: true },
        responses: new Map([
          [
            '/data-model-objects',
            {
              // 10 items < batchSize=50, so pagination stops after 1 request
              data: Array.from({ length: 10 }, (_, i) => ({
                name: `dmo_${i}`,
                label: `DMO ${i}`,
                category: 'Other',
                fields: [],
                isSegmentable: false,
                dataSpaceName: 'default',
              })),
            },
          ],
        ]),
      });

      assert.equal(result.data.length, 10);
    });
  });

  describe('identity-resolution list', () => {
    it('maps columns correctly (label, rulesetStatus, lastJobStatus)', async () => {
      const { tableData } = await runCommand(IdentityResolutionList, {
        flags: { 'target-org': {}, 'api-version': '66.0', timing: false, all: false },
        responses: new Map([
          [
            '/identity-resolutions',
            {
              data: [
                {
                  label: 'Main',
                  rulesetStatus: 'PUBLISHED',
                  lastJobStatus: 'SUCCESS',
                  totalUnifiedProfiles: 1420,
                  consolidationRate: 16,
                },
              ],
            },
          ],
        ]),
      });

      assert.equal(tableData.length, 1);
      const row = tableData[0] as Record<string, unknown>;
      assert.equal(row.label, 'Main');
      assert.equal(row.rulesetStatus, 'PUBLISHED');
    });
  });
});
