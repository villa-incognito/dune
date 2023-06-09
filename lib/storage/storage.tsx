import { logger } from "lib/logger/browser";

// Accessing localStorage may fail in embeds, so catch any errors.
export const tryLocalStorageSetItem = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    logger.warn(err);
  }
};

export const tryLocalStorageGetItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    logger.warn(err);
    return null;
  }
};

export const tryLocalStorageRemoveItem = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    logger.warn(err);
    return null;
  }
};

export const tryLocalStorageListen = (fn: (event: StorageEvent) => void) => {
  if (typeof window === "undefined") return;
  try {
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  } catch (err) {
    logger.warn(err);
  }
};
