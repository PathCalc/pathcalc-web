import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Info } from 'lucide-react';

import { MarkdownContent } from '@/components/MarkdownContent';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBreakpoint } from '@/lib/hooks/tailwind';

export function MoreInfo({ textMarkdown }: { textMarkdown: string }) {
  const isDesktop = useBreakpoint('md');
  return (
    <div className="h-full p-5 flex flex-row justify-center items-center">
      <HoverCard openDelay={100}>
        <HoverCardTrigger href="#">
          <Info size={20} className="cursor-pointer" />
        </HoverCardTrigger>
        <HoverCardContent
          side={isDesktop ? 'right' : 'bottom'}
          align={isDesktop ? 'start' : 'center'}
          className="z-50 px-6 pt-6 pb-8 max-w-[80vw] w-fit sm:min-w-[500px] sm:max-w-[500px]"
        >
          <HoverCardArrow style={{ fill: 'white' }} />

          <ScrollArea className="max-h-[70vh] flex flex-col">
            <div className="flex flex-col gap-3">
              <MarkdownContent textMarkdown={textMarkdown} />
            </div>
          </ScrollArea>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
