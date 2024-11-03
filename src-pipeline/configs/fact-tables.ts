import { basename, dirname } from 'path';
import { Glob } from 'bun';

import { Dimension } from '~shared/pipeline/models/dimension/dimension';
import { FactTable } from '~shared/pipeline/models/fact-table/fact-table';
import { factTableConfigSchema } from '~shared/pipeline/models/fact-table/fact-table-config-schema';
import { readJsonFileSync } from '@/utils/files';
import { ProcessingContext } from '@/utils/processing-context';

export async function readFactTablesConfigDirectory(ctx: ProcessingContext, dimensionsLookup: Map<string, Dimension>) {
  const globResult = new Glob('input/data/fact-tables/*/meta.json').scanSync();

  const paths = [...globResult].toSorted();

  const factTables: FactTable[] = [];

  for (const path of paths) {
    const factTable = await ctx.addPath(path).exec((c) => readFactTableConfigMetaFile(c, path, dimensionsLookup));
    factTables.push(factTable);
  }

  return factTables;
}

function factTableIdFromMetaPath(path: string) {
  return basename(dirname(path));
}

export async function readFactTableConfigMetaFile(
  ctx: ProcessingContext,
  path: string,
  dimensionsLookup: Map<string, Dimension>,
) {
  const factTableId = factTableIdFromMetaPath(path);

  const metaContent = readJsonFileSync(path);

  const { data: parsedMeta, error } = factTableConfigSchema.safeParse(metaContent);

  if (error) {
    throw new Error(`Error parsing fact table config: ${error.message}`);
  }

  console.log(parsedMeta);
  const { id, type, sharding, storage, columns } = parsedMeta;

  if (id !== factTableId) {
    throw new Error(`field "id" should match the id from the path (${factTableId}) but is: ${id}`);
  }

  const factTable = new FactTable(id, type, sharding, storage, columns);
  await populateFactTableLinkedDimensions(ctx, factTable, dimensionsLookup);

  return factTable;
}

async function populateFactTableLinkedDimensions(
  ctx: ProcessingContext,
  factTable: FactTable,
  dimensionsLookup: Map<string, Dimension>,
) {
  for (const column of factTable.columns) {
    if (column.type === 'dimension') {
      const dimension = dimensionsLookup.get(column.id);
      if (!dimension) {
        throw new Error(`Dimension not found for column ${column.id}`);
      }
      factTable.linkedDimensions.set(column.id, dimension);
    }
  }
  return factTable;
}
