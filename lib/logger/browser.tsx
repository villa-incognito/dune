const error = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.error("[dune:error]", ...args);
};

const warn = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.warn("[dune:warn]", ...args);
};

const info = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.info("[dune:info]", ...args);
};

const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[dune:debug]", ...args);
  }
};

const test = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "test") {
    // eslint-disable-next-line no-console
    console.debug("[dune:test]", ...args);
  }
};

export const logger = {
  debug,
  error,
  info,
  test,
  warn,
};
