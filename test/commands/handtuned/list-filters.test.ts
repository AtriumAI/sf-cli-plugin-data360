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

/** `expect`/`expectUnset` are the exact URL tails, so a duplicated or misplaced param fails. */
const cases: Array<{
  name: string;
  cmd: unknown;
  extra: Record<string, unknown>;
  flag: string;
  value: string;
  key: string;
  expect: string;
  expectUnset: string;
}> = [
  {
    name: 'segment list',
    cmd: SegmentList,
    extra: {},
    flag: 'filters',
    value: 'Name CONTAINS QA',
    key: 'filters',
    expect: '/segments?filters=Name%20CONTAINS%20QA&batchSize=200&limit=200&offset=0',
    expectUnset: '/segments?batchSize=200&limit=200&offset=0',
  },
  {
    name: 'segment list',
    cmd: SegmentList,
    extra: {},
    flag: 'order-by',
    value: 'Name desc',
    key: 'orderBy',
    expect: '/segments?orderBy=Name%20desc&batchSize=200&limit=200&offset=0',
    expectUnset: '/segments?batchSize=200&limit=200&offset=0',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'creation-type',
    value: 'Standard',
    key: 'creationType',
    expect:
      '/data-model-objects/ssot__Account__dlm/relationships?creationType=Standard&batchSize=200&limit=200&offset=0',
    expectUnset: '/data-model-objects/ssot__Account__dlm/relationships?batchSize=200&limit=200&offset=0',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'status',
    value: 'Active',
    key: 'status',
    expect: '/data-model-objects/ssot__Account__dlm/relationships?status=Active&batchSize=200&limit=200&offset=0',
    expectUnset: '/data-model-objects/ssot__Account__dlm/relationships?batchSize=200&limit=200&offset=0',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'sort-by',
    value: 'CreatedDate',
    key: 'sortBy',
    expect: '/data-model-objects/ssot__Account__dlm/relationships?sortBy=CreatedDate&batchSize=200&limit=200&offset=0',
    expectUnset: '/data-model-objects/ssot__Account__dlm/relationships?batchSize=200&limit=200&offset=0',
  },
  {
    name: 'dmo relationship-list',
    cmd: DmoRelationshipList,
    extra: { name: 'ssot__Account__dlm' },
    flag: 'order-by',
    value: 'desc',
    key: 'orderBy',
    expect: '/data-model-objects/ssot__Account__dlm/relationships?orderBy=desc&batchSize=200&limit=200&offset=0',
    expectUnset: '/data-model-objects/ssot__Account__dlm/relationships?batchSize=200&limit=200&offset=0',
  },
  {
    name: 'data-graph metadata',
    cmd: DataGraphMetadata,
    extra: {},
    flag: 'entity-name',
    value: 'Acct',
    key: 'dataGraphEntityName',
    expect: '/data-graphs/metadata?dataGraphEntityName=Acct',
    expectUnset: '/data-graphs/metadata',
  },
  {
    name: 'metadata get',
    cmd: MetadataGet,
    extra: {},
    flag: 'entity-name',
    value: 'Acct',
    key: 'dataGraphEntityName',
    expect: '/data-graphs/metadata?dataGraphEntityName=Acct',
    expectUnset: '/data-graphs/metadata',
  },
  {
    name: 'data-stream list',
    cmd: DataStreamList,
    extra: {},
    flag: 'connection-name',
    value: 'SFDC_Home',
    key: 'connectionName',
    expect: '/data-streams?connectionName=SFDC_Home&batchSize=200&limit=200&offset=0',
    expectUnset: '/data-streams?batchSize=200&limit=200&offset=0',
  },
];

describe('list filter query parameters', () => {
  for (const { name, cmd, extra, flag, value, key, expect, expectUnset } of cases) {
    it(`${name} --${flag} sends ${key}`, async () => {
      const { requestLog } = await runCommand(cmd as Cmd, {
        flags: { ...base, ...extra, [flag]: value },
        defaultResponse: {},
      });

      assert.equal(requestLog.length, 1);
      assert.ok(requestLog[0].url.endsWith(expect), `${requestLog[0].url} !endsWith ${expect}`);
    });

    it(`${name} omits ${key} when --${flag} is unset`, async () => {
      const { requestLog } = await runCommand(cmd as Cmd, {
        flags: { ...base, ...extra },
        defaultResponse: {},
      });

      assert.ok(requestLog[0].url.endsWith(expectUnset), `${requestLog[0].url} !endsWith ${expectUnset}`);
    });
  }

  it('segment list combines dataspace, filters and order-by without a stray separator', async () => {
    const { requestLog } = await runCommand(SegmentList, {
      flags: { ...base, dataspace: 'Marketing', filters: 'Name CONTAINS QA', 'order-by': 'Name desc' },
      defaultResponse: { segments: [] },
    });

    const { url } = requestLog[0];
    const want =
      '/segments?dataspace=Marketing&filters=Name%20CONTAINS%20QA&orderBy=Name%20desc' +
      '&batchSize=200&limit=200&offset=0';
    assert.ok(url.endsWith(want), `${url} !endsWith ${want}`);
    assert.equal(url.split('?').length, 2, url);
  });
});
