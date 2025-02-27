import { z } from 'zod';

import { dimensionIdSchema } from '../dimension/dimension-config-schema';

export const measureTypeColumnSchema = z.object({
  name: z.string().describe('Unique column name.'),
  type: z.literal('measure').describe('measure: a column that contains numeric values to be aggregated.'),
  label: z.string().optional().describe('Human-readable label to be used in the app for the column.'),
  // unit: z.string().optional(),
  aggregationMethod: z.enum(['sum']).optional(),
});

export type MeasureColumnConfig = z.infer<typeof measureTypeColumnSchema>;

export const dimensionTypeColumnSchema = z.object({
  name: z.string().describe('Unique column name. For a dimension column, this must refer to an existing dimension ID.'),
  type: z
    .literal('dimension')
    .describe(
      'dimension: a column that contains categorical values which can be used to organise and process data and charts.',
    ),
});

export type DimensionColumnConfig = z.infer<typeof dimensionTypeColumnSchema>;

export const factTableConfigColumnSchema = z
  .discriminatedUnion('type', [dimensionTypeColumnSchema.strict(), measureTypeColumnSchema.strict()])
  .describe('Fact table column configuration');

export type FactTableConfigColumn = z.infer<typeof factTableConfigColumnSchema>;

export const factTableConfigTypeSchema = z.enum(['raw', 'web']);
export type FactTableType = z.infer<typeof factTableConfigTypeSchema>;

export const factTableConfigStorageTypeSchema = z.enum(['local-input', 'local-public']);
export type FactTableStorageType = z.infer<typeof factTableConfigStorageTypeSchema>;

const tableIdSchema = z.string().describe('Fact table unique identifier');

const tableShardingSchema = z
  .array(dimensionIdSchema)
  .max(1)
  .describe('Fact table sharding. Currently only supports one dimension equal to "Scenario"');

const tableStorageSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z
        .literal('local-input')
        .describe('local-input: Local input/ folder fact table storage configuration (for loading raw data)'),
      pattern: z
        .string()
        .describe(
          'Pattern for sharded CSV file paths.\nTreated as relative to /input/[NAME-OF-TABLE]/ folder.\nExample: "shards/{Scenario}.csv"',
        ),
    }),
    z.object({
      type: z
        .literal('local-public')
        .describe(
          'local-public: Local public/ folder fact table storage configuration (for writing out pre-processed web tables)',
        ),
      pattern: z
        .string()
        .describe(
          'Pattern for sharded CSV file paths.\nTreated as relative to /public/data/fact-tables/[NAME-OF-TABLE]/ folder.\nExample: "{Scenario}.csv"',
        ),
    }),
  ])
  .describe('Fact table storage configuration');

const tableColumnsSchema = z.array(factTableConfigColumnSchema).describe('List of fact table columns');

export const factTableConfigSchema = z
  .discriminatedUnion('type', [
    z
      .object({
        type: z.literal('raw'),
        id: tableIdSchema,
        sharding: tableShardingSchema,
        storage: tableStorageSchema,
        columns: tableColumnsSchema,
      })
      .strict()
      .describe('Raw / input fact table configuration'),
    z
      .object({
        type: z.literal('web'),
        id: tableIdSchema,
        sharding: tableShardingSchema,
        storage: tableStorageSchema,
      })
      .strict()
      .describe('Web / output fact table configuration'),
  ])
  .describe('Fact table configuration');

export type FactTableConfig = z.infer<typeof factTableConfigSchema>;
