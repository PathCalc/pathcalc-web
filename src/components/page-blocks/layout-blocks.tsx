import React, { ReactNode } from 'react';
import { z } from 'zod';

export const someBlockConfigSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

export type SomeBlockConfig = z.infer<typeof someBlockConfigSchema>;

export const ContainerBlock = ({ children }: { children?: ReactNode }) => {
  return <div className="grow shrink flex flex-col justify-stretch items-stretch h-full p-10">{children}</div>;
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
    <div className="grow shrink flex flex-col justify-start items-stretch">
      {title && <h3>{title}</h3>}
      <div className="grow shrink flex flex-row items-center">{children}</div>
    </div>
  );
};
