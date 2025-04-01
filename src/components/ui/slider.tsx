'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface SliderExtraProps {
  renderTooltipContent?: (value: number) => React.ReactNode;
  tooltipContentProps?: React.ComponentProps<typeof TooltipContent>;
  tooltipProps?: React.ComponentProps<typeof Tooltip>;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & SliderExtraProps
>(({ className, renderTooltipContent, tooltipContentProps = {}, tooltipProps = {}, ...props }, ref) => {
  const value = props.value as number[];
  const [isDragging, setIsDragging] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handlePointerDown = () => {
    setShowTooltip(true);
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setShowTooltip(false);
    setIsDragging(false);
  };

  React.useEffect(() => {
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseMove = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setShowTooltip(false);
    }
  };

  const thumbHeight = 'h-5';

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center overflow-visible',
        thumbHeight, // make sure sidebar height covers the thumb
        className,
      )}
      onPointerDown={handlePointerDown}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <TooltipProvider>
        <Tooltip open={showTooltip} delayDuration={100} {...tooltipProps}>
          <TooltipTrigger asChild>
            <SliderPrimitive.Thumb
              className={cn(
                thumbHeight,
                `block w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
              )}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" {...tooltipContentProps}>
            {renderTooltipContent ? renderTooltipContent(value[0]) : <p>{value[0]}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
