/**
 * Shared utility: pagination cursor styles, driven through real commands so the wiring is proved too.
 */
import assert from 'node:assert/strict';
import { Org } from '@salesforce/core';
import { runCommand } from '../helpers/runCommand.js';
import { fetchAllPages } from '../../src/shared/data360/pagination.js';
import { CrudListCommand } from '../../src/shared/data360/crudBase.js';
import CalculatedInsightList from '../../src/commands/data360/calculated-insight/list.js';
import DataSpaceMembers from '../../src/commands/data360/data-space/members.js';

class WidgetList extends CrudListCommand<Record<string, unknown>> {
  protected readonly endpoint = '/widgets';
  protected readonly columns = [{ key: 'name', name: 'Name' }];
}

/** A full page, or the offset heuristic stops the loop before the cursor is ever consulted. */
const fullPage = (prefix: string): Array<Record<string, unknown>> =>
  Array.from({ length: 200 }, (_, i) => ({ name: `${prefix}${i}` }));

const allFlags = { 'target-org': {}, 'api-version': '66.0', timing: false, all: true };

describe('pagination cursors', () => {
  it('follows a nextPageToken nested beside a dotted arrayKey', async () => {
    const { requestLog, result } = await runCommand(CalculatedInsightList, {
      flags: allFlags,
      responses: new Map<string, unknown>([
        ['offset=0', { collection: { items: fullPage('CI_'), nextPageToken: 'cursor1' } }],
        ['pageToken=cursor1', { collection: { items: [{ name: 'CI_last' }] } }],
      ]),
    });

    assert.equal(requestLog.length, 2);
    assert.ok(requestLog[1].url.includes('pageToken=cursor1'), requestLog[1].url);
    assert.equal(result.totalSize, 201);
  });

  it('follows a top-level continuationToken', async () => {
    const { requestLog, result } = await runCommand(DataSpaceMembers, {
      flags: { ...allFlags, name: 'default' },
      responses: new Map<string, unknown>([
        ['offset=0', { members: fullPage('M_'), continuationToken: 'tok1' }],
        ['continuationToken=tok1', { members: [{ name: 'M_last' }] }],
      ]),
    });

    assert.equal(requestLog.length, 2);
    assert.ok(requestLog[1].url.includes('continuationToken=tok1'), requestLog[1].url);
    assert.equal(result.totalSize, 201);
  });

  it('never follows currentPageToken, which names the page already in hand', async () => {
    const { requestLog } = await runCommand(CalculatedInsightList, {
      flags: allFlags,
      defaultResponse: { collection: { items: [{ name: 'CI_0' }], currentPageToken: 'eyJvZiI6MCwiYnMiOjI1fQ==' } },
    });

    assert.equal(requestLog.length, 1);
  });

  it('never follows a reflected pageToken, which is the request param, not a response cursor', async () => {
    const { requestLog } = await runCommand(CalculatedInsightList, {
      // A miss falls through to {}, so a followed cursor terminates and the test fails instead of hanging.
      responses: new Map<string, unknown>([
        ['offset=0', { collection: { items: [{ name: 'CI_0' }], pageToken: 'reflected' } }],
      ]),
      flags: allFlags,
    });

    assert.equal(requestLog.length, 1);
    assert.ok(!requestLog[0].url.includes('pageToken='), requestLog[0].url);
  });

  it('reads totalSize from beside a nested array', async () => {
    const { requestLog, result } = await runCommand(CalculatedInsightList, {
      responses: new Map<string, unknown>([['offset=0', { collection: { items: fullPage('CI_'), totalSize: 200 } }]]),
      flags: allFlags,
    });

    // totalSize satisfied by the first page: without it the exactly-full page would request offset=200.
    assert.equal(requestLog.length, 1);
    assert.equal(result.totalSize, 200);
  });

  it('still follows nextBatchId with the same URL as before', async () => {
    const { requestLog, result } = await runCommand(WidgetList, {
      flags: allFlags,
      responses: new Map<string, unknown>([
        ['offset=0', { data: fullPage('W_'), nextBatchId: 'b1' }],
        ['nextBatchId=b1', { data: [{ name: 'W_last' }] }],
      ]),
    });

    assert.equal(requestLog.length, 2);
    assert.ok(requestLog[1].url.endsWith('/widgets?batchSize=200&nextBatchId=b1'), requestLog[1].url);
    assert.equal(result.totalSize, 201);
  });

  it('prefers nextPageUrl over a token cursor when a response carries both', async () => {
    const { requestLog } = await runCommand(WidgetList, {
      flags: allFlags,
      responses: new Map<string, unknown>([
        [
          'offset=0',
          {
            data: fullPage('W_'),
            nextPageUrl: '/services/data/v66.0/ssot/widgets?cursor=abc',
            nextPageToken: 'tok',
          },
        ],
        ['cursor=abc', { data: [{ name: 'W_last' }] }],
      ]),
    });

    assert.equal(requestLog.length, 2);
    assert.ok(requestLog[1].url.includes('cursor=abc'), requestLog[1].url);
    assert.ok(!requestLog[1].url.includes('pageToken'), requestLog[1].url);
  });

  it('stops when a token cursor leads to an empty page', async () => {
    const { requestLog, result } = await runCommand(WidgetList, {
      flags: allFlags,
      responses: new Map<string, unknown>([
        ['offset=0', { data: fullPage('W_'), nextPageToken: 'c1' }],
        ['pageToken=c1', { data: [] }],
      ]),
    });

    assert.equal(requestLog.length, 2);
    assert.equal(result.totalSize, 200);
  });
});

describe('pagination termination', () => {
  /** Drives fetchAllPages directly: a request cap turns a non-terminating loop into a fast failure. */
  const cappedOrg = (limit: number, response: () => unknown): { org: Org; urls: string[] } => {
    const urls: string[] = [];
    const org = {
      getConnection: () => ({
        requestGet: (url: string): Promise<unknown> => {
          urls.push(url);
          if (urls.length > limit) return Promise.reject(new Error(`NON_TERMINATING after ${limit} requests`));
          return Promise.resolve(response());
        },
      }),
    } as unknown as Org;
    return { org, urls };
  };

  it('stops when nextBatchId repeats rather than re-requesting the page in hand', async () => {
    const { org, urls } = cappedOrg(5, () => ({ data: fullPage('W_'), nextBatchId: 'stuck' }));

    const rows = await fetchAllPages<Record<string, unknown>>(org, '66.0', '/widgets', { all: true });

    assert.equal(urls.length, 2);
    assert.ok(urls[1].includes('nextBatchId=stuck'), urls[1]);
    assert.equal(rows.length, 400);
  });

  it('stops when nextPageToken repeats rather than re-requesting the page in hand', async () => {
    const { org, urls } = cappedOrg(5, () => ({ data: fullPage('W_'), nextPageToken: 'stuck' }));

    const rows = await fetchAllPages<Record<string, unknown>>(org, '66.0', '/widgets', { all: true });

    assert.equal(urls.length, 2);
    assert.ok(urls[1].includes('pageToken=stuck'), urls[1]);
    assert.equal(rows.length, 400);
  });

  it('stops when continuationToken repeats rather than re-requesting the page in hand', async () => {
    const { org, urls } = cappedOrg(5, () => ({ data: fullPage('W_'), continuationToken: 'stuck' }));

    const rows = await fetchAllPages<Record<string, unknown>>(org, '66.0', '/widgets', { all: true });

    assert.equal(urls.length, 2);
    assert.ok(urls[1].includes('continuationToken=stuck'), urls[1]);
    assert.equal(rows.length, 400);
  });

  it('stops when a repeated nextPageUrl is echoed back', async () => {
    const { org, urls } = cappedOrg(5, () => ({
      data: fullPage('W_'),
      nextPageUrl: '/services/data/v66.0/ssot/widgets?cursor=stuck',
    }));

    const rows = await fetchAllPages<Record<string, unknown>>(org, '66.0', '/widgets', { all: true });

    assert.equal(urls.length, 2);
    assert.equal(rows.length, 400);
  });

  it('does not fall back to offset paging when a cursor chain ends on an exactly-full page', async () => {
    const { requestLog, result } = await runCommand(WidgetList, {
      flags: allFlags,
      responses: new Map<string, unknown>([
        ['offset=0', { data: fullPage('W_'), nextPageToken: 'c1' }],
        ['pageToken=c1', { data: fullPage('W2_') }],
      ]),
    });

    assert.equal(requestLog.length, 2);
    assert.ok(
      requestLog.every((r, i) => i === 0 || !r.url.includes('offset=')),
      requestLog.map((r) => r.url).join(' ')
    );
    assert.equal(result.totalSize, 400);
  });
});
