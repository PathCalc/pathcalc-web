import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { z } from 'zod';

import { ErrorFallback } from '../react/ErrorFallback';

export const someBlockConfigSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

export type SomeBlockConfig = z.infer<typeof someBlockConfigSchema>;

export const ContainerBlock = ({ children }: { children?: ReactNode }) => {
  return <div className="grow shrink flex flex-col justify-stretch items-stretch h-full p-10 gap-5">{children}</div>;
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
    <div className="grow shrink flex flex-col justify-start items-stretch w-full gap-5">
      <div>{title != null ? <h2 className="text-xl inline-block">{title}</h2> : null}</div>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <div className="grow shrink flex flex-row items-center gap-5">{children}</div>
      </ErrorBoundary>
    </div>
  );
};
