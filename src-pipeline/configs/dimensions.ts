import { extname, join } from 'path';
import { Glob } from 'bun';
import { unique } from 'remeda';

import { Dimension } from '~shared/pipeline/models/dimension/dimension';
import {
  dimensionConfigSingleFileSchema,
  dimensionConfigSplitFileSchema,
  dimensionDomainConfigSchema,
} from '~shared/pipeline/models/dimension/dimension-config-schema';
import { formatZodValidationError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';
import { csvParseToStringObjs } from '@/utils/csv';
import { isDirectory, nameFromPath, readJsonFileSync } from '@/utils/files';

export async function readDimensionsConfigDirectory(ctx: ProcessingContext) {
  const globResult = new Glob('input/data/dimensions/*').scanSync({
    onlyFiles: false,
  });

  const paths = [...globResult].toSorted();

  const dimensions = [];

  for (const path of paths) {
    const dimension = await ctx.exec((c) => loadDimensionConfigLocal(c, path));
    dimensions.push(dimension);
  }

  const dimensionsLookup = new Map(dimensions.map((d) => [d.id, d]));

  await processDimensionLinks(ctx, dimensionsLookup);

  return dimensionsLookup;
}

/** Populate links betwen dimensions. When a dimension content item has a field such as :Name then this links to dimension Name
 *
 */
export async function processDimensionLinks(ctx: ProcessingContext, dimensionsLookup: Map<string, Dimension>) {
  for (const dimension of dimensionsLookup.values()) {
    for (const domainColumn of dimension.domainColumns.filter(
      (c) => c.type === 'dimension' && c.domainType === 'linked',
    )) {
      await ctx
        .addContext('- linked dimensions:\n')
        .addPath(`Dim ${dimension.id}`)
        .addPath(`-> column ${domainColumn.name}`)
        .exec(async (c) => {
          const linkedDimensionId = domainColumn.name;
          const dimensionToLink = dimensionsLookup.get(linkedDimensionId);
          if (!dimensionToLink) {
            throw new Error(`Dimension ${dimension.id} links to non-existent dimension ${linkedDimensionId}`);
          }

          const alreadyLinked = dimension.dimensionLinks.has(linkedDimensionId);

          if (!alreadyLinked) {
            dimension.dimensionLinks.set(linkedDimensionId, dimensionToLink);
          }

          for (const linkValue of unique(dimension.domainTable.array(domainColumn.name) as any[])) {
            await c.addPath(`-> value ${linkValue}`).exec(async () => {
              if (linkValue == null) return;

              if (typeof linkValue !== 'string') {
                throw new Error(
                  `Values of dimension column ${linkedDimensionId} should be strings, but found: ${JSON.stringify(linkValue)}`,
                );
              }

              if (!dimensionToLink.domainValuesSet.has(linkValue)) {
                throw new Error(
                  `Dimension column ${linkedDimensionId} contains value ${linkValue} which links to non-existent value in dimension ${linkedDimensionId}`,
                );
              }
            });
          }
        });
    }
  }
}

export async function loadDimensionConfigLocal(ctx: ProcessingContext, path: string) {
  const isDir = isDirectory(path);

  const dimension = await ctx
    .addPath(path)
    .exec(() => (isDir ? loadDimensionConfigLocalDirectory(path) : loadDimensionConfigLocalFile(path)));

  return dimension;
}

export async function loadDimensionSplitFileConfigMetaFile(directoryPath: string) {
  const idFromPath = nameFromPath(directoryPath);
  const metaFile = Bun.file(join(directoryPath, 'meta.json'));
  if (!(await metaFile.exists())) {
    throw new Error(`dimension directory must contain a "meta.json" file`);
  }

  const config = await metaFile.json();

  const { data: parsedConfig, error } = dimensionConfigSplitFileSchema.safeParse(config);

  if (error) {
    throw new Error(`invalid "meta.json" file in directory \n${formatZodValidationError(error)}`);
  }

  const { id, label } = parsedConfig;

  if (parsedConfig.id !== idFromPath) {
    throw new Error(
      `"id" field in meta.json file should match ID from directory name - expected ${idFromPath}, but is: ${parsedConfig.id}`,
    );
  }

  return { id, label };
}
export async function loadDimensionConfigLocalDirectory(path: string) {
  const idFromPath = nameFromPath(path);

  const { id, label } = await loadDimensionSplitFileConfigMetaFile(path);

  const domainFile = Bun.file(join(path, `${idFromPath}.csv`));

  if (!(await domainFile.exists())) {
    throw new Error(`dimension directory should contain a "${idFromPath}.csv" file`);
  }

  const domainCsvText = await domainFile.text();

  const domainContent = csvParseToStringObjs(domainCsvText);

  const { data: domain, error } = dimensionDomainConfigSchema.safeParse(domainContent);

  if (error) {
    throw new Error(
      `invalid "${idFromPath}.csv" file in directory \nValidation errors: ${formatZodValidationError(error)}`,
    );
  }

  return new Dimension(id, domain, label);
}

export async function loadDimensionConfigLocalFile(path: string) {
  const idFromPath = nameFromPath(path);
  const extension = extname(path);

  if (extension !== '.json') {
    throw new Error(`single-file dimension definition must be a JSON file, but is: ${extname(path)}`);
  }

  const config = readJsonFileSync(path);

  const { data: parsedConfig, error } = dimensionConfigSingleFileSchema.safeParse(config);

  if (error) {
    throw new Error(`invalid JSON file \n${formatZodValidationError(error)}`);
  }

  const { id, label, domain } = parsedConfig;

  if (id !== idFromPath) {
    throw new Error(`"id" field in JSON file should match ID from file name - expected ${idFromPath}, but is: ${id}`);
  }

  return new Dimension(id, domain, label);
}
