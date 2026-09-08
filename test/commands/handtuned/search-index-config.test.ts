/**
 * Tier 3: search-index config — org-level endpoint, no path param.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import SearchIndexConfig from '../../../src/commands/data360/search-index/config.js';

describe('search-index config', () => {
  it('sends GET to the org-level /search-index/config with no path param', async () => {
    const { requestLog } = await runCommand(SearchIndexConfig, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false },
      defaultResponse: { config: '{"version":"1.0"}' },
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'GET');
    assert.ok(requestLog[0].url.endsWith('/ssot/search-index/config'), requestLog[0].url);
  });

  it('surfaces the config field the endpoint returns', async () => {
    const { result, tableData } = await runCommand(SearchIndexConfig, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false },
      defaultResponse: { config: '{"version":"1.0"}' },
    });

    assert.equal(result.data.config, '{"version":"1.0"}');
    assert.equal(tableData.length, 1);
  });

  it('declares no --name', () => {
    const flags = SearchIndexConfig.flags as Record<string, unknown>;
    assert.equal(flags.name, undefined);
  });
});
