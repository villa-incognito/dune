import { logger } from "lib/logger/browser";
import { frontend } from "lib/env/env";
import { hasOwnProperty } from "lib/types/types";

export class HTTPError extends Error {
  statusCode: number;
  jsonBody: Object;
  constructor(statusCode: number, jsonBody: any) {
    super(jsonBody.error || `${statusCode}: ${JSON.stringify(jsonBody)}`);
    this.statusCode = statusCode;
    this.jsonBody = jsonBody;
  }

  errorKey(): string {
    if (hasOwnProperty(this.jsonBody, "key")) {
      return String(this.jsonBody.key);
    }
    return "genericError";
  }
}

interface ExtraFetchOptions {
  timeoutMs?: number;
}

// Perform an HTTP POST request.
export const httpPost = <T,>(
  url: string,
  data?: object,
  options?: RequestInit & ExtraFetchOptions
) => {
  return httpFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    ...(options ?? {}),
  });
};

// Perform an HTTP request.
export const httpFetch = async <T,>(
  url: string,
  options: RequestInit & ExtraFetchOptions = {}
) => {
  logger.debug("http request", url);

  // Set optional client side timeout on request
  let timeoutId: NodeJS.Timeout | undefined;
  if (options?.timeoutMs) {
    const controller = new AbortController();
    timeoutId = setTimeout(
      () => controller.abort("timeout"),
      options.timeoutMs
    );
    options.signal = controller.signal;
  }

  // Fetch the response and parse the body as JSON.
  // The node-fetch library requires absolute URLs.
  const abs = new URL(url, frontend()).toString();
  const res = await fetch(abs, options);

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  const data = await parseResponseData(res);

  // Throw all error codes as exceptions.
  // Looks for an error field in the response.
  if (res.status >= 400) {
    throw new HTTPError(res.status, data);
  }

  return data as T;
};

export function withRetry<T>(
  fetchWrapper: () => Promise<T>,
  options: { maxRetries: number; retryIntervalMs: number }
) {
  return new Promise<T>((resolve, reject) => {
    const wrapper = (attemptsLeft: number) => {
      fetchWrapper()
        .then((res) => {
          resolve(res);
        })
        .catch(async (err) => {
          if (
            err.name === "AbortError" ||
            (err instanceof HTTPError && err.statusCode > 499)
          ) {
            if (attemptsLeft > 0) {
              const retryIntervalMs = options.retryIntervalMs;
              const attempts = options.maxRetries - attemptsLeft;
              const delay = retryIntervalMs * 3 ** attempts; // exponential backoff (eg: 1s, 3s, 9s...)
              // eslint-disable-next-line no-console
              console.log(`Fetch failed with ${err}, retrying in ${delay}ms.}`);
              await new Promise((resolve) => setTimeout(resolve, delay));

              wrapper(--attemptsLeft);
            } else {
              reject(err);
            }
          } else {
            reject(err);
          }
        });
    };

    wrapper(options.maxRetries || 0);
  });
}

// Parse a response as JSON if possible. Redash sets Content-Type to
// "text/html" for JSON responses, so checking the header won't work.
const parseResponseData = async (res: Response) => {
  try {
    return await res.json();
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {};
    } else {
      throw err;
    }
  }
};
