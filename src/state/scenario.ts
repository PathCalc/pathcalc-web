import { atom, useAtom, useAtomValue } from 'jotai';
import { atomEffect, withAtomEffect } from 'jotai-effect';
import { focusAtom } from 'jotai-optics';
import { atomFamily, atomWithDefault } from 'jotai/utils';

import { PresetConfig } from '~shared/app/models/scenarios';
import * as scenariosConfig from '@/../public/config/scenarios.json';
import { deepEqual } from '@/lib/deep-equal';
import { AtomEffectFn, atomWithQueryParam } from '@/lib/jotai';

import { s_globalUrlLocation } from './url';

// === LEVERS STATE ===

export const s_leverConfigs = atom(scenariosConfig.levers);

export function useLeversConfig() {
  return useAtomValue(s_leverConfigs);
}

const s_defaultLeverValues = atom((get) => {
  const levers = get(s_leverConfigs);

  return Object.fromEntries(levers.map((l) => [l.id, l.values.min]));
});

// === URL LEVER VALUES STATE ===

// Utility to parse scenario from URL format ("avoid+1;shift+4;costs+5")
function parseLeverValues(scenarioString: string) {
  const parsedValues: Record<string, number> = {};

  scenarioString.split(';').forEach((entry) => {
    const [key, value] = entry.split(':');
    if (key && value !== undefined) {
      parsedValues[key] = Number(value);
    }
  });

  return parsedValues;
}

// Utility to serialize lever values into URL format
function serializeLeverValues(leverValues: Record<string, number>) {
  return Object.entries(leverValues)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
}

const se_syncLeverValuesFromUrl: AtomEffectFn = (get, set) => {
  const urlValues = get(s_urlLeverValues);
  if (urlValues) {
    set(s_leverValues, { ...urlValues });
  }
};

export const s_urlLeverValues = withAtomEffect(
  atomWithQueryParam(s_globalUrlLocation, 'scenario', serializeLeverValues, parseLeverValues),
  se_syncLeverValuesFromUrl,
);

// === LEVER VALUES STATE ===

const syncLeverValuesToUrl: AtomEffectFn = (get, set) => {
  const leverValues = get(s_leverValues);
  if (!deepEqual(leverValues, get(s_urlLeverValues))) {
    set(s_urlLeverValues, leverValues, { replace: true });
  }
};

export const s_leverValues = atomWithDefault((get) => get(s_urlLeverValues) ?? get(s_defaultLeverValues));

// activate the effect in the React tree to sync the URL with the lever values
export const se_leverValuesToUrl = withAtomEffect(s_leverValues, syncLeverValuesToUrl);

export const s_leverValue_byId = atomFamily((id: string) => focusAtom(s_leverValues, (o) => o.prop(id)));

export function useLever(id: string) {
  return useAtom(s_leverValue_byId(id));
}

export const s_scenario = atom((get) => {
  const leverConfigs = get(s_leverConfigs);
  const leverValues = get(s_leverValues);

  return leverConfigs.map((l) => leverValues[l.id]).join('');
});

export const s_firstScenario = atomWithDefault((get) => get(s_scenario));

export function useScenario() {
  return useAtomValue(s_scenario);
}

// === PRESETS STATE ===

export type PresetConfigWithKey = PresetConfig & { leverKey: string };

export const s_presetConfigs = atom<PresetConfigWithKey[]>(
  scenariosConfig.presets.map((p) => ({ ...p, leverKey: JSON.stringify(p.scenario) })),
);

export const s_selectedPreset = atomWithDefault<string | undefined>(() => undefined);

export const se_leverValuesToPreset = atomEffect((get, set) => {
  const presets = get(s_presetConfigs);
  const leverValues = get(s_leverValues);
  const leverKey = JSON.stringify(leverValues);

  const presetConfigForLevers = presets.find((p) => p.leverKey === leverKey);
  if (presetConfigForLevers) {
    set(s_selectedPreset, presetConfigForLevers.id);
  } else {
    set(s_selectedPreset, undefined);
  }
});
