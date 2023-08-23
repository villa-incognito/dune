let hasRun: Record<string, boolean> = {};

export default function useRunOnce(uniqueKey: string, fn: () => void) {
  if (!hasRun[uniqueKey]) {
    hasRun[uniqueKey] = true;
    fn();
  }
}

export function __tests__clearRunOnce() {
  hasRun = {};
}
