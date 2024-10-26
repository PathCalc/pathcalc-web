import { useEffect } from 'react';

export function useLog<T>(value: T, format?: (x: T) => any) {
  useEffect(() => {
    console.log(format ? format(value) : value);
  }, [value, format]);
}
