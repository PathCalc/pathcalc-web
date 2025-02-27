import { useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { atom, Atom, SetStateAction, WritableAtom } from 'jotai/vanilla';
import { Effect } from 'node_modules/jotai-effect/dist/atomEffect';

import { deepEqual } from './deep-equal';

// curry second argument of atomFamily to be deepEqual
export const $atomFamily = <Param, AtomType extends Atom<unknown>>(initializeAtom: (param: Param) => AtomType) =>
  atomFamily(initializeAtom, deepEqual);

type Location = {
  pathname?: string;
  searchParams?: URLSearchParams;
  hash?: string;
};

type AtomWithLocation = WritableAtom<Location, [SetStateAction<Location>, { replace?: boolean }?], void>;

export function atomWithQueryParam<T>(
  globalLocationAtom: AtomWithLocation,
  paramName: string,
  serialize: (value: T) => string,
  deserialize: (value: string) => T | null,
) {
  return atom(
    (get) => {
      const urlParams = get(globalLocationAtom).searchParams;
      const value = urlParams?.get(paramName);
      return value != null ? deserialize(value) : null;
    },
    (get, set, newValue: T | null, options?: { replace?: boolean }) => {
      set(
        globalLocationAtom,
        (prev) => {
          const newParams = new URLSearchParams(prev.searchParams);
          if (newValue === null) {
            newParams.delete(paramName);
          } else {
            newParams.set(paramName, serialize(newValue));
          }
          return { ...prev, searchParams: newParams };
        },
        options,
      );
    },
  );
}

export type AtomEffectFn = Effect;
export type AtomEffect = Atom<unknown> & { effect: AtomEffectFn };

export const AtomEffect = ({ atomEffect }: { atomEffect: AtomEffect }) => {
  useAtom(atomEffect);

  return null;
};
