import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class UnexpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnexpectedError';
  }
}

export function formatZodValidationError<Input>(error: ZodError<Input>): string {
  const validationError = fromError(error);
  return validationError.toString();
}
