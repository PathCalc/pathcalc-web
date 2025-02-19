import { Info } from 'lucide-react';
import { useEffect, useId, useState, useTransition } from 'react';

import { MarkdownContent } from '@/components/MarkdownContent';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LeverConfig, useLever, useLeversConfig } from '@/state/scenario';

export function Levers() {
  const leverConfigs = useLeversConfig();
  return (
    <div className="flex flex-col gap-6">
      <h2 className="">Ambition levers</h2>
      <div className="flex flex-col gap-6">
        {leverConfigs.map((lever) => (
          <Lever key={lever.id} {...lever} />
        ))}
      </div>
    </div>
  );

/** Bi-directional sync between a global value and a local value backing an input
 * (sync from local to global can be done in a transition)
 **/
function useLocalValue<T>(
  globalValue: T,
  setGlobalValue: (val: T) => void,
  withTransition: boolean = false,
): [T, (val: T) => void] {
  const [localValue, setLocalValue] = useState(globalValue);
  const [, startTransition] = useTransition();
  const handleChange = (x: T) => {
    setLocalValue(x);
    if (withTransition) {
      startTransition(() => setGlobalValue(x));
    } else {
      setGlobalValue(x);
    }
  };
  useEffect(() => {
    setLocalValue(globalValue);
  }, [globalValue]);

  return [localValue, handleChange];
}

function Lever({ id, label, description, values }: LeverConfig) {
  const [globalValue, setGlobalValue] = useLever(id);
  const [value, handleChange] = useLocalValue(globalValue, setGlobalValue, true);

  const sliderId = useId();
  return (
    <div className="flex flex-col gap-3 items-stretch">
      <div className="flex flex-row justify-between items-center">
        <Label htmlFor={sliderId}>{label}</Label>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Info size={15} />
            </TooltipTrigger>
            <TooltipContent side="right" align="start" className="max-w-[70vw] md:max-w-screen-sm -mt-2">
              <div className="flex flex-col gap-3">
                <MarkdownContent textMarkdown={description} />
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Slider
        id={sliderId}
        value={[value]}
        onValueChange={(x) => {
          handleChange(x[0]);
        }}
        min={values.min}
        max={values.max}
        step={1}
      />
    </div>
  );
}
