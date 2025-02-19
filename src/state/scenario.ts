import { atom, useAtom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { focusAtom } from 'jotai-optics';
import { atomFamily, atomWithDefault } from 'jotai/utils';
import { z } from 'zod';

import * as scenariosConfig from '@/../public/config/scenarios.json';
import { deepEqual } from '@/lib/deep-equal';
import { AtomEffectFn, atomWithQueryParam } from '@/lib/jotai';

import { s_globalUrlLocation } from './url';

// === CONFIG SCHEMAS ===

export const leverConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  values: z.object({
    min: z.number(),
    max: z.number(),
  }),
});

export type LeverConfig = z.infer<typeof leverConfigSchema>;

export const presetConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  scenario: z.string(),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;

export const scenariosConfigSchema = z.object({
  levers: z.array(leverConfigSchema),
  presets: z.array(presetConfigSchema),
});

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
function parseScenario(scenarioString: string) {
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
function serializeScenario(leverValues: Record<string, number>) {
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
  atomWithQueryParam(s_globalUrlLocation, 'scenario', serializeScenario, parseScenario),
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
