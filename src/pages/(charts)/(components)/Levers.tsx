import { Info } from 'lucide-react';
import { useId, useState, useTransition } from 'react';

import { MarkdownContent } from '@/components/MarkdownContent';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LeverConfig, useLever, useLeversConfig } from '@/state/scenario';

export function Levers() {
  const leverConfigs = useLeversConfig();
  return (
    <div className="flex flex-col gap-10">
      {leverConfigs.map((lever) => (
        <Lever key={lever.id} {...lever} />
      ))}
    </div>
  );
}

function Lever({ id, label, description, values }: LeverConfig) {
  const [globalValue, setGlobalValue] = useLever(id);
  const [value, setValue] = useState(globalValue);
  const [, startTransition] = useTransition();
  const handleChange = (x: number) => {
    setValue(x);
    startTransition(() => setGlobalValue(x));
  };

  const sliderId = useId();
  return (
    <div className="flex flex-col gap-4 items-stretch">
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
