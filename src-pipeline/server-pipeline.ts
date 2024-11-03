import { WatchEventType } from 'fs';

import { reportDimensions } from '~shared/pipeline/models/dimension/report-dimensions';
import { reportFactTables } from '~shared/pipeline/models/fact-table/report-fact-tables';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineMultiflow } from '~shared/pipeline/models/pipeline/pipeline-multiflow';

import { ProcessingContext } from '../src-shared/pipeline/utils/processing-context';
import { readDimensionsConfigDirectory } from './configs/dimensions';
import { readFactTablesConfigDirectory } from './configs/fact-tables';
import { readPipelineFlowsConfigDirectory } from './configs/pipelines';

export type FileChanges = Map<string, WatchEventType>;

export class ServerPipeline {
  private pipelineEnvironment: PipelineEnvironment = new PipelineEnvironment('server', new Map(), new Map());
  private pipelineMultiflows: PipelineMultiflow[] = [];
  private ctx: ProcessingContext = new ProcessingContext();

  async processDimensionsConfig() {
    const dimensions = await this.ctx.addContext('Dimensions config').exec((c) => readDimensionsConfigDirectory(c));

    this.pipelineEnvironment.dimensions = dimensions;
    // dimensions.values().forEach((d) => d.log());

    reportDimensions(dimensions.values().toArray());
  }

  async processFactTablesConfig() {
    const factTables = await this.ctx
      .addContext('Fact tables config')
      .exec((c) => readFactTablesConfigDirectory(c, this.pipelineEnvironment.dimensions));

    this.pipelineEnvironment.factTables = factTables;

    reportFactTables(factTables.values().toArray());
  }

  async processPipelineFlowsConfig() {
    const pipelineMultiflows = await this.ctx
      .addContext('Pipeline flows config')
      .exec((c) => readPipelineFlowsConfigDirectory(c));

    this.pipelineMultiflows = pipelineMultiflows;
  }

  async dryRun(fileChanges: FileChanges) {
    this.ctx = new ProcessingContext();

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
    if (fileChangePaths.some((p) => p.startsWith('dimensions/'))) {
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

    switch (true) {
      case firstRun:
      case dimensionChanges:
        console.log('Reprocessing dimensions config');
        await this.processDimensionsConfig();
      case factTableChanges:
        console.log('Reprocessing fact tables config');
        await this.processFactTablesConfig();
      case pipelineChanges:
        console.log('Reprocessing pipeline config');
        await this.processPipelineFlowsConfig();

        // console.log('Pipeline environment:');
        // console.log(this.pipelineEnvironment);

        for (const pipelineMultiflow of this.pipelineMultiflows) {
          await pipelineMultiflow.dryRun(this.ctx, this.pipelineEnvironment);
        }

        break;
      default:
        console.log('Unknown/unhandled configuration changes detected, this is a potential bug');
        console.log(`Changes detected in: ${fileChangePaths.join(', ')}`);
    }
  }

  async run() {
    throw new Error('Not implemented');
  }
}
