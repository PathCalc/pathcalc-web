import { EventName as FileEventName } from 'chokidar/handler';

import { reportDimensions } from '~shared/pipeline/models/dimension/report-dimensions';
import { reportFactTables } from '~shared/pipeline/models/fact-table/report-fact-tables';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineMultiflow } from '~shared/pipeline/models/pipeline/pipeline-multiflow';

import { ProcessingContext } from '../src-shared/pipeline/utils/processing-context';
import { readDimensionsConfigDirectory } from './configs/dimensions';
import { readFactTablesConfigDirectory } from './configs/fact-tables';
import { readPipelineFlowsConfigDirectory } from './configs/pipelines';

export type FileChanges = Map<string, FileEventName>;

export class ServerPipeline {
  private pipelineEnvironment: PipelineEnvironment = new PipelineEnvironment('server', new Map(), new Map());
  private pipelineMultiflows: PipelineMultiflow[] = [];

  protected async processDimensionsConfig(ctx: ProcessingContext) {
    const dimensions = await ctx.addContext('Dimensions config').exec((c) => readDimensionsConfigDirectory(c));

    this.pipelineEnvironment.dimensions = dimensions;

    for (const dimension of dimensions.values()) {
      dimension.log();

      // temporary saving of dimensions to files
      // const dimensionPath = `output/${dimension.id}.json`;
      // await Bun.write(dimensionPath, JSON.stringify(dimension, null, 2));
    }

    reportDimensions(dimensions.values().toArray());
  }

  protected async processFactTablesConfig(ctx: ProcessingContext) {
    const factTables = await ctx
      .addContext('Fact tables config')
      .exec((c) => readFactTablesConfigDirectory(c, this.pipelineEnvironment.dimensions));

    this.pipelineEnvironment.factTables = factTables;

    reportFactTables(factTables.values().toArray());
  }

  protected async processPipelineFlowsConfig(ctx: ProcessingContext) {
    const pipelineMultiflows = await ctx
      .addContext('Pipeline flows config')
      .exec((c) => readPipelineFlowsConfigDirectory(c));

    this.pipelineMultiflows = pipelineMultiflows;
  }

  public async dryRun(ctx: ProcessingContext, fileChanges: FileChanges) {
    const fileChangePaths = fileChanges.keys().toArray();

    let firstRun = false,
      dimensionChanges = false,
      factTableChanges = false,
      pipelineChanges = false;

    if (fileChangePaths.length === 0) {
      // for the first run, no file changes will be detected, so we need to run everything
      firstRun = true;
      console.log('First run');
    }
    if (fileChangePaths.some((p) => p.startsWith('data/dimensions/'))) {
      dimensionChanges = true;
      console.log('Dimensions config changes detected');
    }
    if (fileChangePaths.some((p) => p.startsWith('data/fact-tables/'))) {
      factTableChanges = true;
      console.log('Fact tables config changes detected');
    }
    if (fileChangePaths.some((p) => p.startsWith('pipeline/'))) {
      pipelineChanges = true;
      console.log('Pipeline config changes detected');
    }

    // disable no-fallthrough because we want to start at the right stage and continue through subsequent steps
    /* eslint-disable no-fallthrough */
    switch (true) {
      case firstRun:
      case dimensionChanges:
        console.log('Reprocessing dimensions config');
        await this.processDimensionsConfig(ctx);
      case factTableChanges:
        console.log('Reprocessing fact tables config');
        await this.processFactTablesConfig(ctx);
      case pipelineChanges:
        console.log('Reprocessing pipeline config');
        await this.processPipelineFlowsConfig(ctx);

        // console.log('Pipeline environment:');
        // console.log(this.pipelineEnvironment);

        console.log('Running pipeline files');
        for (const pipelineMultiflow of this.pipelineMultiflows) {
          await ctx
            .addContext('Pipeline dry run')
            .addPath(pipelineMultiflow.id)
            .exec(async (c) => {
              await pipelineMultiflow.reset();
              await pipelineMultiflow.dryRun(c, this.pipelineEnvironment);
            });
        }

        break;
      default:
        console.log('Unknown/unhandled configuration changes detected, this is a potential bug');
        console.log(`Changes detected in: ${fileChangePaths.join(', ')}`);
    }
  }

  public async run(ctx: ProcessingContext, multiflowIds?: string[]) {
    await ctx.addContext('Dry run before run').exec(async (c) => {
      await this.dryRun(c, new Map());
    });

    const isFilesListSpecified = multiflowIds && multiflowIds.length > 0;
    for (const pipelineMultiflow of this.pipelineMultiflows) {
      if (!isFilesListSpecified || multiflowIds?.includes(pipelineMultiflow.id)) {
        await ctx
          .addContext('Pipeline run')
          .addPath(pipelineMultiflow.id)
          .exec(async (c) => {
            await pipelineMultiflow.run(c, this.pipelineEnvironment);
          });
      }
    }
  }
}
