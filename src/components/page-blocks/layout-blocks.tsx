import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { z } from 'zod';

import { MarkdownContent } from '../MarkdownContent';
import { ErrorFallback } from '../react/ErrorFallback';

export const someBlockConfigSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

export type SomeBlockConfig = z.infer<typeof someBlockConfigSchema>;

export const ContainerBlock = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="grow shrink flex flex-col justify-start items-stretch h-full p-2 pt-5 md:p-8 gap-10">
      {children}
    </div>
  );
};

export const rowBlockSConfigSchema = z.object({
  type: z.literal('row'),
  title: z.string().optional(),
  items: z.array(someBlockConfigSchema),
});

export type RowBlockConfig = z.infer<typeof rowBlockSConfigSchema>;

type RowBlockConfigWithoutTypeAndItems = Omit<RowBlockConfig, 'items' | 'type'>;

export const RowBlock = ({ title, children }: { children?: ReactNode } & RowBlockConfigWithoutTypeAndItems) => {
  return (
    <div className="shrink flex flex-col justify-start items-stretch w-full gap-3">
      <div>{title != null ? <h2 className="text-xl inline-block">{title}</h2> : null}</div>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <div className="grow shrink flex flex-col lg:flex-row items-center gap-5">{children}</div>
      </ErrorBoundary>
    </div>
  );
};

export const textBlockConfigSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
});

export type TextBlockConfig = z.infer<typeof textBlockConfigSchema>;

type TextBlockConfigWithoutType = Omit<TextBlockConfig, 'type'>;

export const TextBlock = ({ content }: TextBlockConfigWithoutType) => {
  return (
    <div className="prose prose-sm prose-a:text-[#C72335]">
      <MarkdownContent textMarkdown={content} />
    </div>
  );
};
