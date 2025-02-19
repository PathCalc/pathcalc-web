// === URL LOCATION STATE ===

import { atomWithLocation } from 'jotai-location';

let patched = false;

// Allow listening to events on pushState and replaceState
const monkeyPatchHistory = () => {
  if (patched) return;

  const patchEvent = (type: 'pushState' | 'replaceState') => {
    const original = window.history[type];
    return function (this: History, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      const event = new Event(type);
      // @ts-expect-error - TS doesn't know about the `arguments` property
      event.arguments = args;
      window.dispatchEvent(event);

      return result;
    };
  };

  history.pushState = patchEvent('pushState');
  history.replaceState = patchEvent('replaceState');

  return (patched = true);
};

monkeyPatchHistory();

export const s_globalUrlLocation = atomWithLocation({
  subscribe: (callback: () => void) => {
    const events = ['popstate', 'pushState', 'replaceState'];

    events.map((event) => window.addEventListener(event, callback));

    return () => {
      events.map((event) => window.removeEventListener(event, callback));
    };
  },
});
