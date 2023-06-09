import { useDebouncedEffect } from "lib/hooks/use-debounced-effect";
import { useState } from "react";

/**
 * Use this hook when you need to do something once a variable comes
 * to rest after changing. E.g. if you have an input value that triggers
 * a network call, and you don't want to make a call for each character
 * that is typed.
 */
export function useDebouncedValue<T>(
  { delayMs }: { delayMs: number },
  input: T
): T {
  const [output, setOutput] = useState<T>(input);

  useDebouncedEffect({ delayMs }, () => setOutput(input), [input]);

  return output;
}
