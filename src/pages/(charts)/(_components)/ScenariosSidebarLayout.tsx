import { ReactNode, useState } from 'react';

import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBreakpoint } from '@/lib/hooks/tailwind';

export function ScenariosSidebarLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useBreakpoint('md');
  return isDesktop ? <DesktopSidebar>{children}</DesktopSidebar> : <MobileDrawer>{children}</MobileDrawer>;
}

export function DesktopSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="w-72 shrink-0 border-r-2 border-r-gray-200">
      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="py-10 px-5">{children}</div>
      </ScrollArea>
    </div>
  );
}

export function MobileDrawer({ children }: { children: ReactNode }) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<string | number | null>(0.5);

  return (
    <Drawer
      dismissible={false}
      modal={false}
      open={true}
      snapPoints={['50px', '300px', 0.5]}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      shouldScaleBackground={false}
      noBodyStyles={true}
      handleOnly={true}
    >
      <DrawerContent className="h-screen z-40">
        <ScrollArea className="h-[calc(100vh-var(--snap-point-height)-60px)] mt-10 pb-10 px-5">{children}</ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
