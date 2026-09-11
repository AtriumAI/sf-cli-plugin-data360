/**
 * Tier 3: --include-mappings is the only way to get a data stream's
 * source-to-DLO field pairs; without it the API returns mappings: [].
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import DataStreamGet from '../../../src/commands/data360/data-stream/get.js';
import DataStreamList from '../../../src/commands/data360/data-stream/list.js';

const base = { 'target-org': {}, 'api-version': '66.0', timing: false };

describe('--include-mappings', () => {
  it('data-stream get sends includeMappings=true when set', async () => {
    const { requestLog } = await runCommand(DataStreamGet, {
      flags: { ...base, name: 'Contact_Home', 'include-mappings': true },
      defaultResponse: { name: 'Contact_Home' },
    });

    assert.ok(requestLog[0].url.endsWith('/data-streams/Contact_Home?includeMappings=true'), requestLog[0].url);
  });

  it('data-stream get omits the parameter entirely when unset', async () => {
    const { requestLog } = await runCommand(DataStreamGet, {
      flags: { ...base, name: 'Contact_Home' },
      defaultResponse: { name: 'Contact_Home' },
    });

    assert.ok(!requestLog[0].url.includes('includeMappings'), requestLog[0].url);
    assert.ok(!requestLog[0].url.includes('?'), requestLog[0].url);
  });

  it('data-stream list sends includeMappings=true when set', async () => {
    const { requestLog } = await runCommand(DataStreamList, {
      flags: { ...base, 'include-mappings': true },
      defaultResponse: { dataStreams: [] },
    });

    assert.ok(requestLog[0].url.includes('includeMappings=true'), requestLog[0].url);
  });

  it('data-stream list omits the parameter when unset', async () => {
    const { requestLog } = await runCommand(DataStreamList, {
      flags: base,
      defaultResponse: { dataStreams: [] },
    });

    assert.ok(!requestLog[0].url.includes('includeMappings'), requestLog[0].url);
  });

  it('data-stream get carries the returned mappings into the mapped result', async () => {
    const pairs = [{ sourceFieldName: 'Email', targetFieldName: 'Email__c' }];
    const { result } = await runCommand(DataStreamGet, {
      flags: { ...base, name: 'Contact_Home', 'include-mappings': true },
      defaultResponse: { name: 'Contact_Home', mappings: pairs },
    });

    assert.deepEqual(result.data.mappings, pairs);
  });

  it('data-stream get reports mappings as [] when the flag is absent', async () => {
    // Live 2026-09-11: the API always returns the key, valued [] without includeMappings.
    const { result } = await runCommand(DataStreamGet, {
      flags: { ...base, name: 'Contact_Home' },
      defaultResponse: { name: 'Contact_Home', mappings: [] },
    });

    assert.deepEqual(result.data.mappings, []);
  });

  it('data-stream get reports mappings as [] when the key is missing entirely', async () => {
    const { result } = await runCommand(DataStreamGet, {
      flags: { ...base, name: 'Contact_Home' },
      defaultResponse: { name: 'Contact_Home' },
    });

    assert.deepEqual(result.data.mappings, []);
  });

  it('data-stream list carries the returned mappings onto every mapped row', async () => {
    const pairs = [{ sourceFieldName: 'Email', targetFieldName: 'Email__c' }];
    const { result } = await runCommand(DataStreamList, {
      flags: { ...base, 'include-mappings': true },
      defaultResponse: { dataStreams: [{ name: 'Contact_Home', mappings: pairs }] },
    });

    assert.deepEqual(result.data[0].mappings, pairs);
  });

  it('declares include-mappings as a boolean defaulting to false', () => {
    for (const cmd of [DataStreamGet, DataStreamList]) {
      const declared = cmd.flags as Record<string, { default?: unknown; type?: string }>;
      assert.equal(declared['include-mappings'].default, false);
    }
  });
});
