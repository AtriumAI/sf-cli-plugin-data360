import { Org, SfError } from '@salesforce/core';
import { fetchAllPages } from './pagination.js';

/**
 * Common name fields used across Data 360 APIs.
 * The resolver checks each field in order when matching by name.
 */
const DEFAULT_NAME_FIELDS = ['developerName', 'name', 'apiName', 'label'];
const DEFAULT_ID_FIELD = 'id';

export type ResolveConfig = {
  /** List endpoint to fetch all records (e.g., '/search-index'). */
  listEndpoint: string;
  /** Fields to check for name matching (default: developerName, name, apiName, label). */
  nameFields?: string[];
  /** Field containing the record ID (default: 'id'). */
  idField?: string;
  /** Array key for extracting records from the list response. */
  arrayKey?: string;
};

/**
 * Resolve a developer name or label to a record ID by listing all records
 * and finding the matching one. Case-insensitive matching.
 *
 * Returns the original value unchanged if it looks like a Salesforce 18-char ID.
 */
export const resolveNameToId = async (
  org: Org,
  apiVersion: string,
  name: string,
  config: ResolveConfig
): Promise<string> => {
  // If it looks like a Salesforce 18-char or 15-char ID, skip resolution
  if (/^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/.test(name)) {
    return name;
  }

  const nameFields = config.nameFields ?? DEFAULT_NAME_FIELDS;
  const idField = config.idField ?? DEFAULT_ID_FIELD;

  const records = await fetchAllPages<Record<string, unknown>>(
    org,
    apiVersion,
    config.listEndpoint,
    { all: true },
    undefined,
    config.arrayKey
  );

  const lowerName = name.toLowerCase();
  const match = records.find((r) =>
    nameFields.some((f) => {
      const val = r[f];
      return typeof val === 'string' && val.toLowerCase() === lowerName;
    })
  );

  if (!match) {
    const available = records
      .map((r) =>
        nameFields
          .map((f) => r[f])
          .filter(Boolean)
          .join('/')
      )
      .filter(Boolean)
      .slice(0, 20);
    const hint = available.length > 0 ? ` Available: ${available.join(', ')}` : '';
    throw new SfError(`Could not resolve "${name}" to an ID.${hint}`, 'NAME_RESOLUTION_FAILED');
  }

  const id = String(match[idField] ?? '');
  if (!id) {
    throw new SfError(
      `Found "${name}" but record has no "${idField}" field. Try passing the ID directly.`,
      'NAME_RESOLUTION_NO_ID'
    );
  }

  return id;
};
