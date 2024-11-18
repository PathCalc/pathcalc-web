'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';
import { createContext } from 'react';

import { useHasHover } from '@/lib/hooks/useHasHover';
import { cn } from '@/lib/utils';

type TooltipTriggerContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TooltipTriggerContext = createContext<TooltipTriggerContextType>({
  open: false,
  setOpen: () => {},
});

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip: React.FC<TooltipPrimitive.TooltipProps> = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(false);

  const hasHover = useHasHover();

  return (
    <TooltipPrimitive.Root
      delayDuration={hasHover ? props.delayDuration : 0}
      onOpenChange={(e) => {
        setOpen(e);
      }}
      open={open}
    >
      <TooltipTriggerContext.Provider value={{ open, setOpen }}>{children}</TooltipTriggerContext.Provider>
    </TooltipPrimitive.Root>
  );
};

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ children, ...props }, ref) => {
  const hasHover = useHasHover();
  const { setOpen } = React.useContext(TooltipTriggerContext);
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      {...props}
      onClick={(e) => {
        if (!hasHover) e.preventDefault();
        setOpen(true);
      }}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
