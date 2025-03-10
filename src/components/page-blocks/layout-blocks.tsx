import React, { FC, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { PlaceholderBlockConfig, RowBlockConfig, TextBlockConfig } from '~shared/app/models/page-blocks/layout-blocks';

import { MarkdownContent } from '../MarkdownContent';
import { makeRenderFallback } from '../react/ErrorFallback';

export const ContainerBlock = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="grow shrink flex flex-col justify-start items-stretch h-full p-2 pt-5 sm:p-8 gap-10">
      {children}
    </div>
  );
};

type RowBlockProps = Omit<RowBlockConfig, 'items' | 'type'>;

export const RowBlock = ({ title, children }: { children?: ReactNode } & RowBlockProps) => {
  return (
    <div className="shrink flex flex-col justify-start items-stretch w-full gap-3">
      <div>{title != null ? <h2 className="text-2xl inline-block">{title}</h2> : null}</div>
      <ErrorBoundary fallbackRender={makeRenderFallback()}>
        <div className="grow shrink flex flex-col lg:flex-row items-center gap-5">{children}</div>
      </ErrorBoundary>
    </div>
  );
};

type TextBlockProps = Omit<TextBlockConfig, 'type'>;

export const TextBlock: FC<TextBlockProps> = ({ content }) => {
  return (
    <div className="prose prose-sm prose-a:text-[#C72335]">
      <MarkdownContent textMarkdown={content} />
    </div>
  );
};

type PlaceholderBlockProps = Omit<PlaceholderBlockConfig, 'type'>;

export const PlaceholderBlock: FC<PlaceholderBlockProps> = () => {
  return <div className="grow w-full min-h-[220px] h-[220px] max-h-[220px]"></div>;
};
