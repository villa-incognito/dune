import * as Sentry from "@sentry/react";

type Now = ReturnType<typeof Date.now>;

export default function fetchServerTimeUnixMs(): Promise<Now> {
  return fetch("/api/now/unix-ms")
    .then((res) => res.json())
    .catch(() => {
      Sentry.captureException(Error("Failed to fetch /api/now/unix-ms"));
      // Use time on machine as fallback
      return Date.now();
    });
}
