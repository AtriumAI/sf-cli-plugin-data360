/**
 * Tier 4: Command Inventory Manifest — snapshot test.
 *
 * Compares the current command metadata against a checked-in manifest.
 * Fails if commands are added, removed, or changed without updating the snapshot.
 *
 * To regenerate: node --loader ts-node/esm scripts/generate-manifest.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverCommands, CommandMeta, CommandManifest } from '../helpers/commandDiscovery.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, '../fixtures/command-manifest.json');

describe('Command Inventory', function () {
  this.timeout(120000);

  let snapshot: CommandManifest;
  let current: CommandMeta[];

  before(async () => {
    const raw = await readFile(MANIFEST_PATH, 'utf8');
    snapshot = JSON.parse(raw) as CommandManifest;
    current = await discoverCommands();
  });

  it('command count matches snapshot', () => {
    assert.equal(
      current.length,
      snapshot.commandCount,
      `Command count changed: snapshot=${snapshot.commandCount}, current=${current.length}. ` +
        'Regenerate manifest: node --loader ts-node/esm scripts/generate-manifest.mjs'
    );
  });

  it('no commands were removed', () => {
    const currentNames = new Set(current.map((c) => c.name));
    const removed = snapshot.commands.filter((c) => !currentNames.has(c.name));
    if (removed.length > 0) {
      assert.fail(
        `${removed.length} command(s) removed since snapshot:\n` +
          removed.map((r) => `  - ${r.name}`).join('\n') +
          '\nRegenerate manifest if intentional.'
      );
    }
  });

  it('no commands were added without updating snapshot', () => {
    const snapshotNames = new Set(snapshot.commands.map((c) => c.name));
    const added = current.filter((c) => !snapshotNames.has(c.name));
    if (added.length > 0) {
      assert.fail(
        `${added.length} new command(s) not in snapshot:\n` +
          added.map((a) => `  - ${a.name}`).join('\n') +
          '\nRegenerate manifest to include them.'
      );
    }
  });

  it('all commands have consistent base classes', () => {
    const diffs: string[] = [];
    for (const snap of snapshot.commands) {
      const curr = current.find((c) => c.name === snap.name);
      if (curr && curr.baseClass !== snap.baseClass) {
        diffs.push(`${snap.name}: ${snap.baseClass} → ${curr.baseClass}`);
      }
    }
    if (diffs.length > 0) {
      assert.fail(
        `${diffs.length} command(s) changed base class:\n` +
          diffs.map((d) => `  - ${d}`).join('\n') +
          '\nRegenerate manifest if intentional.'
      );
    }
  });

  it('all commands have consistent endpoints', () => {
    const diffs: string[] = [];
    for (const snap of snapshot.commands) {
      const curr = current.find((c) => c.name === snap.name);
      if (curr && curr.endpoint !== snap.endpoint) {
        diffs.push(`${snap.name}: "${snap.endpoint}" → "${curr.endpoint}"`);
      }
    }
    if (diffs.length > 0) {
      assert.fail(
        `${diffs.length} command(s) changed endpoint:\n` +
          diffs.map((d) => `  - ${d}`).join('\n') +
          '\nRegenerate manifest if intentional.'
      );
    }
  });

  it('all commands have consistent flags', () => {
    const diffs: string[] = [];
    for (const snap of snapshot.commands) {
      const curr = current.find((c) => c.name === snap.name);
      if (!curr) continue;
      const snapFlags = snap.flags.join(',');
      const currFlags = curr.flags.join(',');
      if (snapFlags !== currFlags) {
        const added = curr.flags.filter((f) => !snap.flags.includes(f));
        const removed = snap.flags.filter((f) => !curr.flags.includes(f));
        const parts: string[] = [];
        if (added.length) parts.push(`+${added.join(',')}`);
        if (removed.length) parts.push(`-${removed.join(',')}`);
        diffs.push(`${snap.name}: ${parts.join(' ')}`);
      }
    }
    if (diffs.length > 0) {
      assert.fail(
        `${diffs.length} command(s) changed flags:\n` +
          diffs.map((d) => `  - ${d}`).join('\n') +
          '\nRegenerate manifest if intentional.'
      );
    }
  });

  // Summary
  after(() => {
    if (!current) return;
    const byBase = new Map<string, number>();
    let withResolution = 0;
    for (const cmd of current) {
      byBase.set(cmd.baseClass, (byBase.get(cmd.baseClass) ?? 0) + 1);
      if (cmd.hasNameResolution) withResolution++;
    }

    console.log(`\n  Inventory: ${current.length} commands`);
    const sorted = [...byBase.entries()].sort((a, b) => b[1] - a[1]);
    for (const [base, count] of sorted) {
      console.log(`    ${base}: ${count}`);
    }
    console.log(`    With name resolution: ${withResolution}`);
  });
});
