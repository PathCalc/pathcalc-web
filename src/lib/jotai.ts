import { atomFamily } from 'jotai/utils';
import { Atom } from 'jotai/vanilla';

import { deepEqual } from './deep-equal';

// curry second argument of atomFamily to be deepEqual
export const $atomFamily = <Param, AtomType extends Atom<unknown>>(initializeAtom: (param: Param) => AtomType) =>
  atomFamily(initializeAtom, deepEqual);
