import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { chartPagesConfigSchema } from '~shared/app/models/chart-pages';
import { generalConfigSchema } from '~shared/app/models/general';
import { scenariosConfigSchema } from '~shared/app/models/scenarios';
import { singleChartPageConfigSchema } from '~shared/app/models/single-chart-page';
import {
  dimensionConfigSingleFileSchema,
  dimensionConfigSplitFileSchema,
} from '~shared/pipeline/models/dimension/dimension-config-schema';
import { factTableConfigSchema } from '~shared/pipeline/models/fact-table/fact-table-config-schema';

import { pipelineConfigSchema } from './src-shared/pipeline/models/pipeline/pipeline-config-schema';

const schemas = [
  {
    schema: dimensionConfigSplitFileSchema,
    outputPath: './docs/schemas/input/data/dimensions/dimension-config-split-file.schema.json',
  },
  {
    schema: dimensionConfigSingleFileSchema,
    outputPath: './docs/schemas/input/data/dimensions/dimension-config-single-file.schema.json',
  },
  { schema: pipelineConfigSchema, outputPath: './docs/schemas/input/pipeline/pipeline-config.schema.json' },
  { schema: factTableConfigSchema, outputPath: './docs/schemas/input/data/fact-tables/fact-table-config.schema.json' },
  {
    schema: generalConfigSchema,
    outputPath: './docs/schemas/public/config/general.schema.json',
  },
  {
    schema: scenariosConfigSchema,
    outputPath: './docs/schemas/public/config/scenarios.schema.json',
  },
  {
    schema: chartPagesConfigSchema,
    outputPath: './docs/schemas/public/config/chart-pages.schema.json',
  },
  {
    schema: singleChartPageConfigSchema,
    outputPath: './docs/schemas/public/config/pages/page.schema.json',
  },
];

// clear out existing schemas
rmdirSync('./docs/schemas', { recursive: true });

schemas.forEach(({ schema, outputPath }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const jsonSchema = zodToJsonSchema(schema);

  // ensure directory exists
  if (!existsSync(dirname(outputPath))) {
    mkdirSync(dirname(outputPath), { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));
  console.log(`Schema written to ${outputPath}`);
});
