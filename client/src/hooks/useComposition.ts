import { useCallback, useRef } from 'react';

interface UseCompositionProps<T extends HTMLElement = HTMLElement> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement = HTMLElement>(props?: UseCompositionProps<T>) {
  const isComposingRef = useRef(false);

  const handleCompositionStart = useCallback((e: React.CompositionEvent<T>) => {
    isComposingRef.current = true;
    props?.onCompositionStart?.(e);
  }, [props]);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<T>) => {
    isComposingRef.current = false;
    props?.onCompositionEnd?.(e);
  }, [props]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<T>) => {
    if (isComposingRef.current) {
      e.stopPropagation();
    }
    props?.onKeyDown?.(e);
  }, [props]);

  return {
    isComposing: isComposingRef.current,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}