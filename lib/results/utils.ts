import { Parameter } from "lib/parameters/types";

export function delayBeforeRefreshJob(queuePos?: number): number {
  const pos: number = queuePos || 0;
  if (pos <= 100) {
    return 2000;
  } else if (pos > 100 && pos <= 1000) {
    return 4000;
  }
  return 6000;
}

export const paramKeys = (params?: Parameter[]): string => {
  return (params || []).map((p) => p?.key).join("_");
};
