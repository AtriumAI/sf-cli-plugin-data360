/**
 * Command discovery and metadata extraction for inventory/manifest generation.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const COMMANDS_DIR = path.join(ROOT, 'src/commands/data360');

export type CommandMeta = {
  name: string;
  file: string;
  summary: string;
  baseClass: string;
  endpoint: string;
  httpMethod: string;
  flags: string[];
  arrayKey: string;
  batchSize: number | null;
  hasNameResolution: boolean;
};

export type CommandManifest = {
  version: string;
  commandCount: number;
  commands: CommandMeta[];
};

const fileToCommandName = (file: string): string => {
  const rel = path.relative(COMMANDS_DIR, file);
  return 'data360 ' + rel.replace(/\.ts$/, '').replace(/\//g, ' ');
};

const fileToRelPath = (file: string): string => path.relative(ROOT, file);

const getBaseClassName = (instance: any, CommandClass: any): string => {
  const proto = Object.getPrototypeOf(CommandClass.prototype);
  const constructorName = proto?.constructor?.name;
  if (constructorName && constructorName !== 'Object') return constructorName;
  return 'Data360Command';
};

const getInstanceProp = (instance: any, prop: string): any => {
  try {
    return instance[prop];
  } catch {
    return undefined;
  }
};

const hasNameResolutionImport = async (filePath: string): Promise<boolean> => {
  try {
    const fs = await import('node:fs/promises');
    const content = await fs.readFile(filePath, 'utf8');
    return content.includes('resolveNameToId');
  } catch {
    return false;
  }
};

export const discoverCommands = async (): Promise<CommandMeta[]> => {
  const files = glob.sync('**/*.ts', { cwd: COMMANDS_DIR, absolute: true }).sort();
  const commands: CommandMeta[] = [];

  for (const file of files) {
    try {
      const mod = await import(file);
      const CommandClass = mod.default;
      if (!CommandClass) continue;

      // Try to create an instance to read instance properties
      let instance: any;
      try {
        instance = new CommandClass([], {} as never);
      } catch {
        instance = Object.create(CommandClass.prototype);
      }

      const flags = CommandClass.flags ? Object.keys(CommandClass.flags).sort() : [];
      const baseClass = getBaseClassName(instance, CommandClass);

      // Extract instance properties
      const endpoint = getInstanceProp(instance, 'endpoint') ?? '';
      const httpMethod = getInstanceProp(instance, 'httpMethod') ?? getInstanceProp(instance, 'updateMethod') ?? '';
      const arrayKey = getInstanceProp(instance, 'arrayKey') ?? '';
      const batchSize = getInstanceProp(instance, 'batchSize') ?? null;

      const usesNameResolution = await hasNameResolutionImport(file);

      commands.push({
        name: fileToCommandName(file),
        file: fileToRelPath(file),
        summary: CommandClass.summary ?? '',
        baseClass,
        endpoint: typeof endpoint === 'string' ? endpoint : '',
        httpMethod: typeof httpMethod === 'string' ? httpMethod : '',
        flags,
        arrayKey: typeof arrayKey === 'string' ? arrayKey : '',
        batchSize: typeof batchSize === 'number' ? batchSize : null,
        hasNameResolution: usesNameResolution,
      });
    } catch {
      commands.push({
        name: fileToCommandName(file),
        file: fileToRelPath(file),
        summary: 'IMPORT_FAILED',
        baseClass: 'UNKNOWN',
        endpoint: '',
        httpMethod: '',
        flags: [],
        arrayKey: '',
        batchSize: null,
        hasNameResolution: false,
      });
    }
  }

  return commands;
};

export const generateManifest = async (): Promise<CommandManifest> => {
  const commands = await discoverCommands();
  return {
    version: '1.0.0',
    commandCount: commands.length,
    commands,
  };
};
