import { Glob } from 'bun';

import { pipelineConfigSchema } from '~shared/pipeline/models/pipeline/pipeline-config-schema';
import { PipelineFlow } from '~shared/pipeline/models/pipeline/pipeline-flow';
import { PipelineMultiflow } from '~shared/pipeline/models/pipeline/pipeline-multiflow';
import { PipelineStep } from '~shared/pipeline/models/pipeline/pipeline-step';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';
import { nameFromPath, readJsonFileSync } from '@/utils/files';

export async function readPipelineFlowsConfigDirectory(ctx: ProcessingContext) {
  const globResult = new Glob('input/pipeline/*.json').scanSync();
  const paths = [...globResult].toSorted();

  const pipelineFiles: PipelineMultiflow[] = [];

  for (const path of paths) {
    const pipelineFile = await ctx.addPath(path).exec((c) => readPipelineFileConfig(c, path));
    pipelineFiles.push(pipelineFile);
  }

  return pipelineFiles;
}

export async function readPipelineFileConfig(ctx: ProcessingContext, path: string) {
  const id = nameFromPath(path);

  if (!id) {
    throw new Error(
      `Error parsing pipeline config file: could not determine id from path: ${path}.\nThis is likely a bug in the code.`,
    );
  }

  const metaContent = readJsonFileSync(path);

  const { data: parsedMeta, error } = pipelineConfigSchema.safeParse(metaContent);

  if (error) {
    throw new Error(`Error parsing pipeline config file: ${error.message}`);
  }

  const multiFlowConfig = parsedMeta;

  const flows = multiFlowConfig.map((steps) => {
    return new PipelineFlow(steps.map((stepCfg) => new PipelineStep(stepCfg)));
  });

  return new PipelineMultiflow(id, flows);
}
