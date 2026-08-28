import { useRef, useCallback } from 'react';

type AnyFunction = (...args: any[]) => any;

export function usePersistFn<T extends AnyFunction>(fn: T): T {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useCallback((...args: Parameters<T>) => {
    return fnRef.current(...args);
  }, []) as T;

  return persistFn;
}