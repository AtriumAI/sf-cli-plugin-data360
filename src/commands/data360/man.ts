import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Args } from '@oclif/core';
import { SfCommand } from '@salesforce/sf-plugins-core';

// eslint-disable-next-line no-underscore-dangle
const manDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../messages/man');

export default class Data360Man extends SfCommand<void> {
  public static readonly summary = 'Show detailed man page for a Data 360 command.';
  public static readonly description =
    'Displays a rich man page with description, flags, API endpoint, notes, ' +
    'testing status, and related commands. No org connection required.';
  public static readonly examples = [
    '$ sf data360 man dmo list',
    '$ sf data360 man segment publish',
    '$ sf data360 man query sqlv2',
    '$ sf data360 man connection list',
  ];
  public static readonly strict = false;
  public static readonly enableJsonFlag = true;

  public static readonly args = {
    command: Args.string({
      description: 'Command path (e.g., "dmo list", "segment publish").',
      required: false,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<void> {
    // Collect all args after "man" as the command path
    const rawArgs = this.argv.filter((a) => !a.startsWith('-'));

    if (rawArgs.length === 0) {
      this.log('Usage: sf data360 man <topic> <command>');
      this.log('');
      this.log('Examples:');
      this.log('  sf data360 man dmo list');
      this.log('  sf data360 man segment publish');
      this.log('  sf data360 man query sqlv2');
      this.log('');
      this.log('Available topics:');
      this.listTopics();
      return;
    }

    // Build man page path: "dmo list" -> "dmo/list.md"
    const manPath = rawArgs.join('/') + '.md';
    const fullPath = resolve(manDir, manPath);

    try {
      const content = readFileSync(fullPath, 'utf8');
      this.log(content);
    } catch {
      this.log(`No man page found for: ${rawArgs.join(' ')}`);
      this.log(`Expected: messages/man/${manPath}`);
      this.log('');
      this.log('Use "sf data360 man" to see available topics.');
    }
  }

  private listTopics(): void {
    try {
      const entries = readdirSync(manDir, { withFileTypes: true });
      const topics = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort();
      for (const topic of topics) {
        this.log(`  ${topic}`);
      }
    } catch {
      this.log('  (man pages directory not found)');
    }
  }
}
