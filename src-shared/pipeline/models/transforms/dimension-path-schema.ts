import { z } from 'zod';

export const dimensionPathSchema = z.string().regex(/^[a-zA-Z0-9]+(:[a-zA-Z0-9]+)*$/);
