/**
 * Tier 3: search-index config — needs --name flag for path injection.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import SearchIndexConfig from '../../../src/commands/data360/search-index/config.js';

describe('search-index config (B23 fix)', () => {
  it('sends GET to /search-index/:name/config with name injected', async () => {
    const { requestLog } = await runCommand(SearchIndexConfig, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, name: 'My_kav' },
      defaultResponse: { configField: 'value' },
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(
      requestLog[0].url.includes('/search-index/My_kav/config'),
      `Expected /search-index/My_kav/config, got: ${requestLog[0].url}`
    );
  });
});
