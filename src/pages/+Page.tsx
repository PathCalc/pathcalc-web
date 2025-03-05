import { useData } from 'vike-react/useData';

import { MarkdownContent } from '@/components/MarkdownContent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSetGeneralConfig } from '@/state/general-config';

import { Data } from './+data';

export function Page() {
  const { moreInfoMarkdown, general } = useData<Data>();

  useSetGeneralConfig(general); //TODO figure out a global method to do this

  return (
    <ScrollArea className="h-[calc(100vh-56px)]">
      <div className="grow shrink max-h-full flex flex-col items-center">
        <div className="grow shrink w-screen max-w-screen lg:max-w-7xl py-10 px-10">
          <article className="mx-auto prose prose-lg prose-a:text-[#C72335]">
            <MarkdownContent textMarkdown={moreInfoMarkdown} />
          </article>
        </div>
      </div>
    </ScrollArea>
  );
}
