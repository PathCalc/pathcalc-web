import { z } from 'zod';

const DIMENSION_PATH_RE = /^[a-zA-Z][a-zA-Z0-9_ ]*(:[a-zA-Z][a-zA-Z0-9_ ]*)*$/;

export const dimensionPathSchema = z
  .string()
  .regex(DIMENSION_PATH_RE)
  .describe(
    'Dimension/column path. Can be a single name, or a nested access path separated by colons, such as X:Y:Z:etc.',
  );
