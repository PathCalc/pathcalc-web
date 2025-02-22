import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useTransition } from 'react';

import { SimpleSelect } from '@/components/SimpleSelect';
import { AtomEffect } from '@/lib/jotai';
import { s_leverValues, s_presetConfigs, s_selectedPreset, se_leverValuesToPreset } from '@/state/scenario';

export function Presets() {
  const presets = useAtomValue(s_presetConfigs);
  const presetOptions = presets.map((preset) => ({ value: preset.id, label: preset.label }));
  const setLeverValues = useSetAtom(s_leverValues);

  const [preset, setPreset] = useAtom(s_selectedPreset);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (preset) {
      const presetConfig = presets.find((p) => p.id === preset);
      if (presetConfig) {
        startTransition(() => {
          setLeverValues(presetConfig.scenario);
        });
      }
    }
  }, [preset, presets, setLeverValues, startTransition]);

  return (
    <>
      <AtomEffect atomEffect={se_leverValuesToPreset} />
      <div className="flex flex-col gap-3 mb-6">
        <h2>Presets</h2>
        <SimpleSelect options={presetOptions} value={preset} onChange={setPreset} placeholder="Select example preset" />
      </div>
    </>
  );
}
