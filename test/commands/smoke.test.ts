/**
 * Tier 1: Command Smoke Tests
 *
 * Dynamically discovers all 192+ commands and validates their static metadata.
 * No API calls — purely tests that commands are well-formed.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const COMMANDS_DIR = path.join(ROOT, 'src/commands/data360');

/** Convert file path to a human-readable command name. */
const fileToCommandName = (file: string): string => {
  const rel = path.relative(COMMANDS_DIR, file);
  return 'data360 ' + rel.replace(/\.ts$/, '').replace(/\//g, ' ');
};

describe('Command Smoke Tests', function () {
  this.timeout(120000);

  let commandFiles: string[];
  let commands: Array<{ file: string; name: string; CommandClass: any }>;

  before(async () => {
    commandFiles = glob.sync('**/*.ts', { cwd: COMMANDS_DIR, absolute: true });
    commandFiles.sort();

    commands = [];
    for (const file of commandFiles) {
      const name = fileToCommandName(file);
      try {
        const mod = await import(file);
        commands.push({ file, name, CommandClass: mod.default });
      } catch (err) {
        // Record import failure — will fail in the test
        commands.push({ file, name, CommandClass: null });
      }
    }
  });

  it('discovers at least 150 commands', () => {
    assert.ok(commands.length >= 150, `Expected >= 150 commands, got ${commands.length}`);
  });

  // Generate individual tests for each command
  describe('individual commands', () => {
    before(function () {
      if (!commands || commands.length === 0) this.skip();
    });

    afterEach(function () {
      // Dynamic test generation needs the commands to be loaded
    });

    it('all commands import successfully', () => {
      const failures = commands.filter((c) => c.CommandClass === null);
      if (failures.length > 0) {
        assert.fail(
          `${failures.length} command(s) failed to import:\n` +
            failures.map((f) => `  - ${f.name} (${f.file})`).join('\n')
        );
      }
    });

    it('all commands have a summary', () => {
      const missing = commands.filter((c) => c.CommandClass && !c.CommandClass.summary);
      if (missing.length > 0) {
        assert.fail(`${missing.length} command(s) missing summary:\n` + missing.map((m) => `  - ${m.name}`).join('\n'));
      }
    });

    it('all commands have enableJsonFlag', () => {
      const missing = commands.filter((c) => c.CommandClass && c.CommandClass.enableJsonFlag !== true);
      if (missing.length > 0) {
        assert.fail(
          `${missing.length} command(s) missing enableJsonFlag:\n` + missing.map((m) => `  - ${m.name}`).join('\n')
        );
      }
    });

    it('all commands have examples', () => {
      const missing = commands.filter(
        (c) => c.CommandClass && (!Array.isArray(c.CommandClass.examples) || c.CommandClass.examples.length === 0)
      );
      if (missing.length > 0) {
        assert.fail(
          `${missing.length} command(s) missing examples:\n` + missing.map((m) => `  - ${m.name}`).join('\n')
        );
      }
    });

    it('all commands have target-org flag', () => {
      const missing = commands.filter((c) => c.CommandClass?.flags && !c.CommandClass.flags['target-org']);
      if (missing.length > 0) {
        assert.fail(
          `${missing.length} command(s) missing target-org flag:\n` + missing.map((m) => `  - ${m.name}`).join('\n')
        );
      }
    });

    it('all commands have api-version flag', () => {
      const missing = commands.filter((c) => c.CommandClass?.flags && !c.CommandClass.flags['api-version']);
      if (missing.length > 0) {
        assert.fail(
          `${missing.length} command(s) missing api-version flag:\n` + missing.map((m) => `  - ${m.name}`).join('\n')
        );
      }
    });

    it('no command has an empty summary', () => {
      const empty = commands.filter((c) => c.CommandClass && c.CommandClass.summary === '');
      assert.equal(empty.length, 0, 'Commands with empty summary: ' + empty.map((e) => e.name).join(', '));
    });
  });

  // Summary output
  after(() => {
    if (commands && commands.length > 0) {
      const byTopic = new Map<string, number>();
      for (const cmd of commands) {
        const parts = cmd.name.split(' ');
        const topic = parts.length >= 2 ? parts[1] : 'root';
        byTopic.set(topic, (byTopic.get(topic) ?? 0) + 1);
      }

      console.log(`\n  Command inventory: ${commands.length} commands across ${byTopic.size} topics`);
      const sorted = [...byTopic.entries()].sort((a, b) => b[1] - a[1]);
      for (const [topic, count] of sorted) {
        console.log(`    ${topic}: ${count}`);
      }
    }
  });
});
