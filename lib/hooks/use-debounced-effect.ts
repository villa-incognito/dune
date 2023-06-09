import { useCallback, useEffect } from "react";

/**
 * Similar to useEffect, but will wait for a delay after deps change
 * before calling the effect function.
 */
export function useDebouncedEffect(
  { delayMs }: { delayMs: number },
  _fn: () => void,
  deps: Array<any>
) {
  // Pass inline function to useCallback. This way it is possible to
  // pass a static function to useDebouncedEffect and still have it
  // be called when the effects change.
  const fn = useCallback(() => _fn(), deps);

  useEffect(() => {
    const id = setTimeout(fn, delayMs);
    return () => clearTimeout(id);
  }, [delayMs, fn]);
}
