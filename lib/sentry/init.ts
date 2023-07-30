/* eslint @typescript-eslint/strict-boolean-expressions: off */

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

export default function sentryInit() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
    enabled: process.env.NODE_ENV !== "development",

    beforeSend(event: Sentry.Event, hint?: Sentry.EventHint) {
      // Filter some events: https://docs.sentry.io/platforms/javascript/configuration/filtering
      if (shouldLog(event, hint)) {
        return event;
      } else {
        return null;
      }
    },

    integrations: [new Integrations.BrowserTracing()],

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.2,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}

const probability = (p: number) => Math.random() < p;

// For a guide on how to use this deny list see https://www.notion.so/duneanalytics/Filtering-out-Sentry-errors-Client-side-50c5953487244ff69ca854eb28a6be14
function shouldLog(event: Sentry.Event, hint?: Sentry.EventHint) {
  switch (event.message) {
    case "ResizeObserver loop limit exceeded":
      // https://sentry.io/organizations/dune-analytics/issues/2976128944
      // May be fixed by PR #512. (It was not.)
      // Added filter just in case, since this error accounted for 85% of all events.
      return false;

    case "ResizeObserver loop completed with undelivered notifications.":
      // https://sentry.io/organizations/dune-analytics/issues/2976133422
      return false;

    case "Unexpected token ...":
      // Two issues: https://sentry.io/organizations/dune-analytics/issues/?environment=production&project=6138642&query=Unexpected+token+...
      // Happens in Firefox 50 (Nov 2016) so not very important
      return probability(1 / 1000);
  }

  // Sometimes it's necessary (or just easier) to check the Error message
  if (hint?.originalException) {
    const error: string | Error = hint.originalException;
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = typeof error === "string" ? "" : error.stack;

    switch (errorMessage) {
      case "ResizeObserver loop completed with undelivered notifications.":
        // https://sentry.io/organizations/dune-analytics/issues/2976133422
        return false;

      case "Abort route change. Please ignore this error.":
        // From our own code. Ignoring as requested 👆
        return false;

      case "TypeError: NetworkError when attempting to fetch resource.":
        // https://sentry.io/organizations/dune-analytics/issues/3492830398
        return false;

      case "Unexpected token '?'":
        // https://dune-analytics.sentry.io/issues/3934152754/?project=6138642&query=is%3Aunresolved&referrer=issue-stream
        return probability(1 / 1000);

      case errorMessage.match(/Failed to fetch/)?.input:
        // These errors are not yet actionable by us since the users network could cause the error.
        // However, it is still interesting to have some idea of how much this is happening to our users.
        // https://sentry.io/organizations/dune-analytics/issues/3496115944
        return probability(1 / 1000);

      case errorMessage.match(
        /PollingBlockTracker - encountered an error while attempting to update latest block/
      )?.input:
        // https://sentry.io/organizations/dune-analytics/issues/3493366518
        return false;

      case errorMessage.match(/No RPC Url available for chainId/)?.input:
        // https://sentry.io/organizations/dune-analytics/issues/3497642905
        return false;
    }

    if (
      errorMessage.match(/Unexpected token/) &&
      errorStack?.match(
        /node_modules\/sql-formatter\/lib\/lexer\/regexFactory\.js/
      )
    ) {
      // These errors are caused by headless browsers
      // https://dune-analytics.sentry.io/issues/3934152754
      return false;
    }
  }

  return true;
}
