export type QueryResponse = {
  [key: string]: unknown;
  data?: unknown;
  metadata?: unknown;
};

export type MetadataColumn = {
  name: string;
  type: string;
  placeInOrder: number;
};

export type VectorMatch = {
  chunk: string;
  score: number | null;
  sourceRecordId: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

const placeInOrder = (input: unknown): number => {
  if (!isRecord(input)) return Number.MAX_SAFE_INTEGER;
  const raw = input.placeInOrder;
  return typeof raw === 'number' ? raw : Number.MAX_SAFE_INTEGER;
};

export const normalizeMetadataColumns = (metadata: unknown): MetadataColumn[] => {
  if (isRecord(metadata)) {
    return Object.entries(metadata)
      .map(([name, info]) => ({
        name,
        type: isRecord(info) && typeof info.type === 'string' ? info.type : '?',
        placeInOrder: placeInOrder(info),
      }))
      .sort((a, b) => a.placeInOrder - b.placeInOrder);
  }

  if (Array.isArray(metadata)) {
    return metadata
      .map((col, index) => {
        if (!isRecord(col)) {
          return { name: `col${index}`, type: '?', placeInOrder: index };
        }

        return {
          name: typeof col.name === 'string' ? col.name : `col${index}`,
          type: typeof col.type === 'string' ? col.type : '?',
          placeInOrder: typeof col.placeInOrder === 'number' ? col.placeInOrder : index,
        };
      })
      .sort((a, b) => a.placeInOrder - b.placeInOrder);
  }

  return [];
};

export const getColumnNames = (metadata: unknown, firstRow: unknown): string[] => {
  const metadataCols = normalizeMetadataColumns(metadata).map((col) => col.name);
  if (metadataCols.length > 0) return metadataCols;

  if (isRecord(firstRow)) return Object.keys(firstRow);
  if (Array.isArray(firstRow)) return firstRow.map((_, i) => `col${i}`);
  return [];
};

export const toDisplayRows = (rows: unknown[], columns: string[], maxLen = 120): Array<Record<string, string>> =>
  rows.map((row) => {
    const out: Record<string, string> = {};

    columns.forEach((column, index) => {
      if (isRecord(row)) {
        out[column] = truncate(asString(row[column]), maxLen);
      } else if (Array.isArray(row)) {
        out[column] = truncate(asString(row[index]), maxLen);
      } else {
        out[column] = truncate(asString(row), maxLen);
      }
    });

    return out;
  });

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const extractVectorMatches = (rows: unknown[]): VectorMatch[] =>
  rows.map((row) => {
    if (isRecord(row)) {
      return {
        chunk: asString(row.Chunk__c),
        score: toNumber(row.score__c),
        sourceRecordId: asString(row.SourceRecordId__c),
      };
    }

    if (Array.isArray(row)) {
      return {
        chunk: asString(row[0]),
        score: toNumber(row[1]),
        sourceRecordId: asString(row[2]),
      };
    }

    return {
      chunk: asString(row),
      score: null,
      sourceRecordId: '',
    };
  });
