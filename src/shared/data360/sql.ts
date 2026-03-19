export type VectorSearchSql = {
  sql: string;
  indexTable: string;
  chunkTable: string;
};

export const quoteIdentifier = (identifier: string): string => `"${identifier.replace(/"/g, '""')}"`;

const escapeSqlString = (value: string): string => value.replace(/'/g, "''");

const normalizeIndexTables = (indexName: string): { indexTable: string; chunkTable: string } => {
  if (indexName.endsWith('_index__dlm')) {
    return {
      indexTable: indexName,
      chunkTable: indexName.replace(/_index__dlm$/, '_chunk__dlm'),
    };
  }

  return {
    indexTable: `${indexName}_index__dlm`,
    chunkTable: `${indexName}_chunk__dlm`,
  };
};

export const buildVectorSearchSql = (indexName: string, queryText: string, limit = 5): VectorSearchSql => {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 5;
  const { indexTable, chunkTable } = normalizeIndexTables(indexName);
  const escapedQuery = escapeSqlString(queryText);

  const sql = [
    'SELECT c."Chunk__c", v."score__c", v."SourceRecordId__c"',
    `FROM vector_search(TABLE("${indexTable}"), '${escapedQuery}', '', ${safeLimit}) AS v`,
    `JOIN "${chunkTable}" AS c ON v."SourceRecordId__c" = c."RecordId__c"`,
    'ORDER BY v."score__c" DESC',
    `LIMIT ${safeLimit}`,
  ].join(' ');

  return { sql, indexTable, chunkTable };
};
