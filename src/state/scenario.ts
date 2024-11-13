import { atom, useAtom, useAtomValue } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { atomFamily, atomWithDefault } from 'jotai/utils';
import { clamp } from 'remeda';
import { z } from 'zod';

import * as scenariosConfig from '@/../public/config/scenarios.json';

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

export const presentConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  scenario: z.string(),
});

export type PresentConfig = z.infer<typeof presentConfigSchema>;

export const scenariosConfigSchema = z.object({
  levers: z.array(leverConfigSchema),
  presets: z.array(presentConfigSchema),
});

export const s_leverConfigs = atom(scenariosConfig.levers);

export function useLeversConfig() {
  return useAtomValue(s_leverConfigs);
}

export const s_leverValues = atomWithDefault((get) => {
  const levers = get(s_leverConfigs);

  return Object.fromEntries(levers.map((l) => [l.id, clamp(1, { min: l.values.min, max: l.values.max })]));
});

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
