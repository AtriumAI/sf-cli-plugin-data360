/**
 * Tier 3: the list-filter query parameters a live sweep proved the API applies.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import SegmentList from '../../../src/commands/data360/segment/list.js';
import DmoRelationshipList from '../../../src/commands/data360/dmo/relationship-list.js';
import DataGraphMetadata from '../../../src/commands/data360/data-graph/metadata.js';
import MetadataGet from '../../../src/commands/data360/metadata/get.js';
import DataStreamList from '../../../src/commands/data360/data-stream/list.js';

const base = { 'target-org': {}, 'api-version': '66.0', timing: false };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cmd = new (...args: any[]) => never;

const cases: Array<{
  name: string;
  cmd: unknown;
  extra: Record<string, unknown>;
  flag: string;
  value: string;
  key: string;
}> = [
  { name: 'segment list', cmd: SegmentList, extra: {}, flag: 'filters', value: 'Name CONTAINS QA', key: 'filters' },
  { name: 'segment list', cmd: SegmentList, extra: {}, flag: 'order-by', value: 'Name desc', key: 'orderBy' },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'creation-type',
    value: 'Standard',
    key: 'creationType',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'status',
    value: 'Active',
    key: 'status',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'sort-by',
    value: 'CreatedDate',
    key: 'sortBy',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'order-by',
    value: 'desc',
    key: 'orderBy',
  },
  {
    name: 'data-graph metadata',
    cmd: DataGraphMetadata,
    extra: {},
    flag: 'entity-name',
    value: 'Acct',
    key: 'dataGraphEntityName',
  },
  { name: 'metadata get', cmd: MetadataGet, extra: {}, flag: 'entity-name', value: 'Acct', key: 'dataGraphEntityName' },
  {
    name: 'data-stream list',
    cmd: DataStreamList,
    extra: {},
    flag: 'connection-name',
    value: 'SFDC_Home',
    key: 'connectionName',
  },
];

describe('list filter query parameters', () => {
  for (const { name, cmd, extra, flag, value, key } of cases) {
    it(`${name} --${flag} sends ${key}`, async () => {
      const { requestLog } = await runCommand(cmd as Cmd, {
        flags: { ...base, ...extra, [flag]: value },
        defaultResponse: {},
      });

      assert.ok(requestLog[0].url.includes(`${key}=${encodeURIComponent(value)}`), requestLog[0].url);
    });

    it(`${name} omits ${key} when --${flag} is unset`, async () => {
      const { requestLog } = await runCommand(cmd as Cmd, {
        flags: { ...base, ...extra },
        defaultResponse: {},
      });

      assert.ok(!requestLog[0].url.includes(`${key}=`), requestLog[0].url);
    });
  }

  it('segment list combines dataspace, filters and order-by without a stray separator', async () => {
    const { requestLog } = await runCommand(SegmentList, {
      flags: { ...base, dataspace: 'Marketing', filters: 'Name CONTAINS QA', 'order-by': 'Name desc' },
      defaultResponse: { segments: [] },
    });

    const { url } = requestLog[0];
    assert.ok(url.includes('dataspace=Marketing'), url);
    assert.ok(url.includes('filters=Name%20CONTAINS%20QA'), url);
    assert.ok(url.includes('orderBy=Name%20desc'), url);
    assert.ok(!url.includes('&&'), url);
    assert.equal(url.split('?').length, 2, url);
  });
});
