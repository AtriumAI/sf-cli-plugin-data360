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
const ROOT = resolve(__dirname, '../..');

/**
 * Deny-listed in Andi's EXCLUDED_COMMANDS and left without flags on purpose: no consumer,
 * and no way to doc-verify their shapes. They fail loudly via DATA360_UNRESOLVED_PATH_PARAM.
 * This set must not grow — a new entry means a command shipped with an unfillable :param.
 */
const KNOWN_UNFILLABLE = new Set([
  'data360 connection preview',
  'data360 data-graph data-by-id',
  'data360 profile calculated-insight',
  'data360 profile child',
  'data360 universal-id lookup',
]);

/** injectResourceId fills only the first :param; anything beyond it needs pathParams() or a run() override. */
const resolvesItsOwnPath = async (file: string): Promise<boolean> => {
  const mod = (await import(resolve(ROOT, file))) as { default?: new () => unknown };
  const proto = mod.default?.prototype as object | undefined;
  if (!proto) return false;
  return ['pathParams', 'run'].some((m) => Object.prototype.hasOwnProperty.call(proto, m));
};

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

  it('no command leaves a :param that nothing can fill', async () => {
    const offenders: string[] = [];
    for (const cmd of current) {
      const params = cmd.endpoint.match(/:[a-zA-Z]\w*/g) ?? [];
      // eslint-disable-next-line no-await-in-loop
      if (params.length > 1 && !(await resolvesItsOwnPath(cmd.file))) {
        offenders.push(cmd.name);
      }
    }

    const unexpected = offenders.filter((name) => !KNOWN_UNFILLABLE.has(name));
    if (unexpected.length > 0) {
      assert.fail(
        `${unexpected.length} command(s) would ship a URL containing a literal :token:\n` +
          unexpected.map((o) => `  - ${o}`).join('\n') +
          '\nDeclare a flag per param and override pathParams(), or add to KNOWN_UNFILLABLE.'
      );
    }

    const fixed = [...KNOWN_UNFILLABLE].filter((name) => !offenders.includes(name));
    if (fixed.length > 0) {
      assert.fail(
        `${fixed.length} command(s) no longer need the exception:\n` +
          fixed.map((f) => `  - ${f}`).join('\n') +
          '\nRemove them from KNOWN_UNFILLABLE.'
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
