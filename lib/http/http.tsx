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

// Perform an HTTP POST request.
export const httpPost = async <T,>(
  url: string,
  data?: object,
  options?: RequestInit
) => {
  return httpFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    ...(options ?? {}),
  });
};

// Perform an HTTP request.
export const httpFetch = async <T,>(url: string, options: RequestInit = {}) => {
  logger.debug("http request", url);

  // Fetch the response and parse the body as JSON.
  // The node-fetch library requires absolute URLs.
  const abs = new URL(url, frontend()).toString();
  const res = await fetch(abs, options);
  const data = await parseResponseData(res);

  // Throw all error codes as exceptions.
  // Looks for an error field in the response.
  if (res.status >= 400) {
    throw new HTTPError(res.status, data);
  }

  return data as T;
};

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
