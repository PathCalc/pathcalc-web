import { basename } from 'path';
import { Glob } from 'bun';

import { Dimension } from '~shared/pipeline/models/dimension/dimension';
import { FactTable, SourceFactTable } from '~shared/pipeline/models/fact-table/fact-table';
import { factTableConfigSchema } from '~shared/pipeline/models/fact-table/fact-table-config-schema';
import { UnexpectedError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';
import { ServerSourceFactTable, ServerWebFactTable } from '@/storage/server-fact-table';
import { readJsonFileSync } from '@/utils/files';

export async function readFactTablesConfigDirectory(ctx: ProcessingContext, dimensionsLookup: Map<string, Dimension>) {
  const globResult = new Glob('input/data/fact-tables/*.json').scanSync();

  const paths = [...globResult].toSorted();

  const factTables: FactTable[] = [];
  // const sourceFactTables: SourceFactTable[] = [];
  // const targetFactTables: WebFactTable[] = [];

  for (const path of paths) {
    const factTable = await ctx.addPath(path).exec((c) => readFactTableConfigMetaFile(c, path, dimensionsLookup));
    // if (factTable.type === 'raw') {
    //   sourceFactTables.push(factTable);
    // } else {
    //   targetFactTables.push(factTable);
    // }
    factTables.push(factTable);
  }

  // return {
  //   source: new Map(sourceFactTables.map((d) => [d.id, d])),
  //   target: new Map(targetFactTables.map((d) => [d.id, d])),
  // };
  return new Map(factTables.map((d) => [d.id, d]));
}

function factTableIdFromMetaPath(path: string) {
  return basename(path).replace('.json', '');
}

export async function readFactTableConfigMetaFile(
  ctx: ProcessingContext,
  path: string,
  dimensionsLookup: Map<string, Dimension>,
): Promise<FactTable> {
  const factTableId = factTableIdFromMetaPath(path);

  const metaContent = readJsonFileSync(path);

  const { data: parsedMeta, error } = factTableConfigSchema.safeParse(metaContent);

  if (error) {
    throw new Error(`Error parsing fact table config: ${error.message}`);
  }

  const { id, type, sharding, storage } = parsedMeta;

  if (id !== factTableId) {
    throw new Error(`field "id" should match the id from the path (${factTableId}) but is: ${id}`);
  }

  if (type === 'web') {
    const factTable = new ServerWebFactTable(id, type, sharding, storage);
    return factTable;
  } else if (type === 'raw') {
    const columns = parsedMeta.columns;
    const factTable = new ServerSourceFactTable(id, type, sharding, storage, columns);
    await populateSourceFactTableLinkedDimensions(ctx, factTable, dimensionsLookup);

    return factTable;
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new UnexpectedError(`Unknown fact table type: ${type}`);
}

async function populateSourceFactTableLinkedDimensions(
  ctx: ProcessingContext,
  factTable: SourceFactTable,
  dimensionsLookup: Map<string, Dimension>,
) {
  for (const column of factTable.columns) {
    if (column.type === 'dimension') {
      const dimension = dimensionsLookup.get(column.name);
      if (!dimension) {
        throw new Error(`Dimension not found for column ${column.name}`);
      }
      factTable.linkedDimensions.set(column.name, dimension);
    }
  }
  return factTable;
}
