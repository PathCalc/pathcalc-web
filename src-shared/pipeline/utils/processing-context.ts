import { ZodError } from 'zod';

import { ConfigError, UnexpectedError } from './errors';

export class ProcessingContext {
  constructor(
    public readonly context: string = '',
    public readonly path: string[] = [],
  ) {}

  addContext(context: string | number) {
    return new ProcessingContext(this.context + ' ' + context, this.path);
  }

  addPath(path: string | number) {
    return new ProcessingContext(this.context, this.path.concat(path.toString()));
  }

  async exec<T>(fn: (ctx: ProcessingContext) => Promise<T>) {
    try {
      return await fn(this);
    } catch (e) {
      let prefix = this.context;
      if (this.path.length > 0) {
        prefix += ' [' + this.path.join(' / ') + ']';
      }

      if (e instanceof ConfigError) {
        throw e;
      } else if (e instanceof UnexpectedError) {
        throw e;
      } else if (e instanceof ZodError) {
        throw new ConfigError(`${prefix}: ${e.toString()}`);
      } else if (e instanceof Error) {
        throw new ConfigError(`${prefix}: ${e.message}`);
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new ConfigError(`${prefix}: ${e}`);
      }
    }
  }
}
