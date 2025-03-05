import { useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import { useEffect } from 'react';

import { GeneralConfig } from '~shared/app/models/general';

export const s_generalConfig = atomWithDefault<GeneralConfig>(null!);

export function useGeneralConfig() {
  return useAtomValue(s_generalConfig);
}

export function useSetGeneralConfig(generalConfig: GeneralConfig) {
  const setGeneralConfig = useSetAtom(s_generalConfig);

  useEffect(() => {
    setGeneralConfig(generalConfig);
  }, [generalConfig, setGeneralConfig]);
}
