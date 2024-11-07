import { z } from 'zod';

import { isShardingSame } from '~shared/pipeline/models/dataset/sharding';
import {
  Dataset,
  DatasetColumn,
  DatasetDimension,
  DatasetShard,
  DimensionTypeColumnLinked,
  DimensionTypeColumnLocal,
  MetadataColumnName,
  MetadataTypeColumn,
  ReadonlyDataset,
  ReadonlyDatasetShard,
} from '~shared/pipeline/models/dataset/types';
import { Dimension } from '~shared/pipeline/models/dimension/dimension';
import { FactTable } from '~shared/pipeline/models/fact-table/fact-table';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineStep } from '~shared/pipeline/models/pipeline/pipeline-step';
import { UnexpectedError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

export const opLoadSchema = z.object({
  $: z.literal('load'),
  from: z.string(),
  sharding: z.array(z.string()),
});

export type LoadConfig = z.infer<typeof opLoadSchema>;

export class LoadStep extends PipelineStep {
  private _sourceFactTable: FactTable | undefined;

  constructor(private _config: LoadConfig) {
    super(_config);
  }
  async dryRun(
    ctx: ProcessingContext,
    dataset: ReadonlyDataset,
    env: PipelineEnvironment,
    tempVars: Map<string, ReadonlyDataset>,
  ): Promise<Dataset> {
    if (dataset != null) {
      throw new Error('$:load can only appear as the first step in a flow');
    }
    const from = this._config.from;
    if (from == null || typeof from !== 'string') {
      throw new Error('$:load step must have "from" field defined');
    }
    const sourceFactTable = env.factTables.get(from);
    if (sourceFactTable == null) {
      throw new Error(`Fact table not found: ${from}`);
    }

    this._sourceFactTable = sourceFactTable;

    await this._sourceFactTable.dryRunLoad();

    if (this._config.sharding == null) {
      throw new Error('$:load step must have sharding defined');
    }
    const stepConfigSharding = this._config.sharding;

    const sourceTableSharding = sourceFactTable.sharding;

    if (!isShardingSame(stepConfigSharding, sourceTableSharding)) {
      throw new Error('Sharding of dataset does not match sharding of fact table');
    }
    const newSharding = stepConfigSharding;

    const newColumns: DatasetColumn[] = sourceFactTable.columns.map((c) => {
      if (c.type === 'measure') {
        return c;
      } else if (c.type === 'dimension') {
        const linkedDimension = sourceFactTable.linkedDimensions.get(c.name)!;
        return {
          name: c.name,
          type: 'dimension',
          domainType: 'linked',
          domain: unrollDimensionToDatasetFormat(linkedDimension),
        };
      } else {
        throw new Error(`Unknown column type: ${(c as any).type}`);
      }
    });

    return {
      sharding: newSharding,
      columns: newColumns,
    };
  }
  async processShard(
    ctx: ProcessingContext,
    datasetShard: DatasetShard,
    tempVarsSharded: Map<string, ReadonlyDatasetShard>,
  ): Promise<DatasetShard> {
    if (this._sourceFactTable == null) {
      throw new UnexpectedError('Pipeline was not initialised before running');
    }

    if (datasetShard.table != null) {
      throw new Error('$:load can only appear as the first step in a flow');
    }

    const table = await this._sourceFactTable.load(datasetShard.shard);

    return {
      table,
      shard: datasetShard.shard,
    };
  }
}

function unrollDimensionToDatasetFormat(dim: Dimension): DatasetDimension {
  return {
    id: dim.id,
    label: dim.label,
    content: {
      table: dim.domainTable.objects(),
      columns: dim.domainColumns.map((c) => {
        if (c.type === 'metadata') {
          return { name: c.name as MetadataColumnName, type: 'metadata' } as MetadataTypeColumn;
        } else if (c.domainType === 'local') {
          return {
            name: c.name,
            type: 'dimension',
            domainType: 'local',
            domain: c.domain.map((d) => ({ id: d.id })),
          } as DimensionTypeColumnLocal;
        } else {
          return {
            name: c.name,
            type: 'dimension',
            domainType: 'linked',
            domain: unrollDimensionToDatasetFormat(dim.dimensionLinks.get(c.domain)!),
          } as DimensionTypeColumnLinked;
        }
      }),
    },
  };
}
