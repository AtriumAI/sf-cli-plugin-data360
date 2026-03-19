/**
 * Tier 3: segment publish — name resolution with marketSegmentId.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import SegmentPublish from '../../../src/commands/data360/segment/publish.js';

describe('segment publish (B11 fix)', () => {
  it('resolves apiName to marketSegmentId then POSTs publish', async () => {
    const { requestLog, result } = await runCommand(SegmentPublish, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'Highly_Engaged' },
      responses: new Map([
        [
          '/segments',
          {
            segments: [
              { apiName: 'Highly_Engaged', displayName: 'Highly Engaged', marketSegmentId: 'mkt-abc-123' },
              { apiName: 'Other_Segment', displayName: 'Other', marketSegmentId: 'mkt-def-456' },
            ],
          },
        ],
        ['/segments/mkt-abc-123/actions/publish', {}],
      ]),
    });

    // First: GET list for name resolution
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(requestLog[0].url.includes('/segments'));

    // Second: POST to publish with marketSegmentId
    assert.equal(requestLog[1].method, 'POST');
    assert.ok(requestLog[1].url.includes('/segments/mkt-abc-123/actions/publish'));
    assert.equal(result.success, true);
    assert.equal(result.id, 'mkt-abc-123');
  });
});
