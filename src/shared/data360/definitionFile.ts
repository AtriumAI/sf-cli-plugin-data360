import { readFile } from 'node:fs/promises';
import { SfError } from '@salesforce/core';

/**
 * Load a JSON definition from a file path or stdin ("-").
 *
 * Used by commands that accept a --definition-file flag for complex payloads
 * (transforms, connections, etc.).
 */
export const loadDefinitionFile = async (filePath: string): Promise<Record<string, unknown>> => {
  try {
    let raw: string;

    if (filePath === '-') {
      raw = await readStdin();
    } else {
      raw = await readFile(filePath, 'utf-8');
    }

    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new SfError(
        `Definition file must contain a JSON object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}.`,
        'DATA360_INVALID_DEFINITION'
      );
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof SfError) throw error;
    const msg = error instanceof Error ? error.message : String(error);
    throw new SfError(`Failed to load definition file "${filePath}": ${msg}`, 'DATA360_DEFINITION_FILE_ERROR');
  }
};

const readStdin = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    process.stdin.on('error', reject);

    // If stdin is a TTY (no pipe), error immediately
    if (process.stdin.isTTY) {
      reject(new SfError('No input on stdin. Pipe a JSON file or provide a file path.', 'DATA360_STDIN_EMPTY'));
    }
  });
