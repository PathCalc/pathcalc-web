import { z } from 'zod';

export const generalConfigSchema = z
  .object({
    logo: z
      .object({
        title: z.string().describe('Primary part of the logotype - displayed in bold'),
        subtitle: z.string().describe('Secondary part of the logotype - displayed in a lighter font'),
      })
      .describe('Logotype configuration for the app.'),
    title: z.string().describe('Title of the app. Displayed in browser tab title.'),
    description: z.string().describe('Description of the app. Displayed in social media previews etc.'),
  })
  .describe('General configuration for the app.');
