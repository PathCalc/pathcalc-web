import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { Dataset, DatasetShard } from '../dataset/types';
import { PipelineEnvironment } from './pipeline-environment';
import { PipelineFlow } from './pipeline-flow';

export class PipelineMultiflow {
  private _tempVars: Map<string, Dataset> = new Map();
  private _shardedTempVars: Map<string, DatasetShard> = new Map();
  constructor(
    public id: string,
    public flows: PipelineFlow[],
  ) {}

  async reset() {
    this._tempVars = new Map();
    for (const flow of this.flows) {
      await flow.reset();
    }
  }

  async resetShardedRun() {
    this._shardedTempVars = new Map();
  }

  async dryRun(ctx: ProcessingContext, env: PipelineEnvironment) {
    for (const [flowIndex, flow] of this.flows.entries()) {
      await ctx.addPath(flowIndex + '').exec(async (c) => {
        console.log('\nMultiflow:', this.id, '-> Sub-flow:', flowIndex + 1);

        const lastReturnDataset = await flow.dryRun(c, env, this._tempVars);

        // let currentDataset: Dataset | undefined = undefined;

        // const numSteps = flow.steps.length;

        // for (const [stepIndex, step] of flow.steps.entries()) {
        //   const newDataset = await step.dryRun(step, currentDataset);

        //   if (newDataset == null) {
        //     throw new Error('Step did not return a dataset');
        //   }
        //   console.log(newDataset);
        //   currentDataset = newDataset;
        // }
      });
    }
  }

  async run(ctx: ProcessingContext, env: PipelineEnvironment) {
    // TODO: allow other sharding than by Scenario
    const scenarioDimension = env.dimensions.get('Scenario');
    if (scenarioDimension == null) {
      throw new Error('Scenario dimension not found');
    }

    const scenarios = scenarioDimension.domain.map((x) => x.id);

    await ctx.addContext('Sharded run start').exec(async (c) => {
      await this.startShardedRun(c);
    });

    for (const scenario of scenarios) {
      await ctx.addPath(scenario).exec(async (c) => {
        await this.runShard(c, { Scenario: scenario }, env);
      });
    }

    await ctx.addContext('Sharded run end').exec(async (c) => {
      await this.endShardedRun(c);
    });
  }

  private async startShardedRun(ctx: ProcessingContext) {
    for (const [index, flow] of this.flows.entries()) {
      await ctx.addPath(`Flow ${index}`).exec(async (c) => {
        await flow.startShardedRun(c);
      });
    }
  }

  private async runShard(ctx: ProcessingContext, shard: Record<string, string>, env: PipelineEnvironment) {
    console.log('Scenario:', shard['Scenario']);
    for (const [index, flow] of this.flows.entries()) {
      // console.log('\nMultiflow:', this.id, '-> Sub-flow:', index);

      await ctx.addPath(index + '').exec(async (c) => {
        await flow.processShard(c, shard, env, this._shardedTempVars);
      });
    }
  }

  private async endShardedRun(ctx: ProcessingContext) {
    for (const flow of this.flows) {
      await flow.endShardedRun(ctx);
    }
  }
}

/**
    // === PROTOTYPE ===

    const tempVars = new Map<string, PDataset>();

    interface PDatasetTable {
      columns: {}[];
    }
    interface PDataset {
      table: PDatasetTable;
      sharding: string[];
      dimensions: Map<string, Dimension>;
    }
   
function isShardingSame(sharding1: string[], sharding2: string[]): boolean {
      return new Set(sharding1).symmetricDifference(new Set(sharding2)).size === 0;
    }

    function dryRunStep(step: PipelineStep, dataset: PDataset | undefined): PDataset {
      let newTable: PDatasetTable | undefined;
      let newSharding: string[] | undefined;
      let newDimensions: Map<string, Dimension> | undefined;

      const $op = step.config.$;

      if ($op === 'load') {
        if (dataset != null) {
          throw new Error('$:load can only appear as the first step in a flow');
        }
        const from = step.config.from;
        if (from == null || typeof from !== 'string') {
          throw new Error('$:load step must have "from" field defined');
        }
        const sourceFactTable = env.factTables.get(from);
        if (sourceFactTable == null) {
          throw new Error(`Fact table not found: ${from}`);
        }

        if (step.config.sharding == null) {
          throw new Error('$:load step must have sharding defined');
        }
        const stepConfigSharding = step.config.sharding as string[];

        const sourceTableSharding = sourceFactTable.sharding;

        if (!isShardingSame(stepConfigSharding, sourceTableSharding)) {
          throw new Error('Sharding of dataset does not match sharding of fact table');
        }
        newSharding = stepConfigSharding;

        newTable = {
          columns: sourceFactTable.columns,
        };

        return {
          table: newTable,
          sharding: newSharding,
          dimensions: newDimensions!,
        };
      } else if ($op === 'load-temp') {
        if (dataset != null) {
          throw new Error('$:load-temp can only appear as the first step in a flow');
        }
        const from = step.config.from;
        if (from == null || typeof from !== 'string') {
          throw new Error('$:load-temp step must have "from" field defined');
        }
        if (!from.startsWith('#')) {
          throw new Error('$load-temp step "from" field must start with a #');
        }

        const sourceDataset = tempVars.get(from);
        if (sourceDataset == null) {
          throw new Error(`$load-temp step "from" field must reference a valid temp dataset: ${from}`);
        }
        newTable = sourceDataset.table;
        if (sourceDataset.sharding == null) {
          throw new Error('$:load-temp step "from" must reference a temp dataset with sharding defined');
        }
        newSharding = sourceDataset.sharding;

        return {
          table: newTable,
          sharding: newSharding,
          dimensions: newDimensions!,
        };
      } else {
        if (dataset == null) {
          throw new Error(`${$op} cannot be the first step in a flow`);
        }

        if ($op === '.') {
          return dataset;
        } else if ($op === 'aggregate') {
          const groupby = step.config.groupby;
        } else if ($op === 'filter') {
          const column = step.config.column;
          const inArg = step.config.in;

          const dims = dataset.dimensions;
        } else if ($op === 'save-temp') {
          const to = step.config.to;

          if (to == null || typeof to !== 'string') {
            throw new Error('$save-temp step must have "to" field defined');
          }
          if (!to.startsWith('#')) {
            throw new Error('$save-temp "to" field must start with a #');
          }
          if (tempVars.has(to)) {
            throw new Error(`$save-temp "to" field must not reference an existing temp dataset: ${to}`);
          }
          tempVars.set(to, dataset);

          return dataset;
        } else if ($op === 'save') {
          // const to = step.config.to;
          // if (to == null || typeof to !== 'string') {
          //   throw new Error('$save step must have "to" field defined');
          // }
          // const targetFactTable = env.factTables.get(to);
          // if (targetFactTable == null) {
          //   throw new Error(`Target fact table not found: ${to}`);
          // }

          // if (targetFactTable.type !== 'web') {
          //   throw new Error(
          //     `Server pipeline can only save to web tables. Tried to save to ${to} which has type: ${targetFactTable.type}`,
          //   );
          // }

          // const stepConfigSharding = step.config.sharding as string[];
          // if (stepConfigSharding == null) {
          //   throw new Error('$save step must have sharding defined');
          // }
          // const targetSharding = targetFactTable.sharding;
          // if (!isShardingSame(stepConfigSharding, targetSharding)) {
          //   throw new Error(
          //     `Sharding specified in $:save config (${stepConfigSharding}) does not match sharding of target fact table (${targetSharding})`,
          //   );
          // }

          // const currentDatasetSharding = dataset.sharding;

          // const shardingSame = isShardingSame(currentDatasetSharding, targetSharding);
          // if (!shardingSame) {
          //   throw new Error(
          //     `Sharding of dataset (${currentDatasetSharding}) does not match sharding of target fact table (${targetSharding})`,
          //   );
          // }
          // return dataset;
        }
      }

      throw new Error(`Unknown operation: ${$op}`);
    }
 */
