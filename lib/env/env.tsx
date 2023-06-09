import { assert } from "lib/assert/assert";

// Check if we're currently running on the Next backend (SSR).
export const isServerSide = () => {
  return typeof window === "undefined";
};

// Check if we're currently building the application (SSG).
export const isBuildTime = () => {
  return Boolean(process.env.BUILD);
};

// Check if an env var is set.
export const hasEnvVar = (key: string) => {
  assert(hasDynamicEnvVars(), "hasEnvVar does not work client-side");
  return Boolean(process.env[key]);
};

// Get the value for an env var, or throw if it is not set.
export const mustEnvVar = (key: string) => {
  assert(hasDynamicEnvVars(), "mustEnvVar does not work client-side");
  const val = process.env[key];
  assert(val, `missing env var: ${key}`);
  return val!;
};

// Check that process.env can be accessed dynamically,
// which is not the case when using WebPack's EnvironmentPlugin.
export const hasDynamicEnvVars = () => {
  return Object.keys(process.env).length > 0;
};

// Get the Hasura URL for the current env.
export const hasura = () => {
  return process.env.NEXT_PUBLIC_DUNE_HSR_CORE_URL;
};

// Get the frontend URL for the current env.
export const frontend = () => {
  if (process.env.VERCEL_GITHUB_COMMIT_REF === "master") {
    return frontendProd;
  } else if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  } else if (typeof window === "undefined") {
    return `http://localhost${frontendDevPort}`;
  } else {
    return window.location.origin;
  }
};

const frontendProd = "https://dune.com";
const frontendDevPort = ":3000";
