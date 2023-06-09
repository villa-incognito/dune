import PostHogSDK from "posthog-js";
import type { PostHog } from "posthog-js";
import React from "react";
import Router from "next/router";
import { SessionContext } from "gui/session/session";
import { logger } from "lib/logger/browser";

// The value returned by the AnalyticsContext
interface AnalyticsContextValue {
  captureEvent: PostHog["capture"];
  posthog: PostHog | undefined;
}

const AnalyticsContext = React.createContext<AnalyticsContextValue>({
  posthog: undefined,
  captureEvent: () => {
    logger.warn(`Analytics provider not initialised`);
    return undefined;
  },
});

export const AnalyticsProvider: React.FC = (props) => {
  const { session, sessionLoading } = React.useContext(SessionContext);
  const [posthog, setPosthog] = React.useState<PostHog>();
  const [current, setCurrent] = React.useState<string>();

  // If posthog has been initialised then send events
  const contextValue: AnalyticsContextValue = {
    captureEvent: (...posthogProps: Parameters<PostHog["capture"]>) => {
      if (posthog) {
        return posthog.capture(...posthogProps);
      }
      logger.warn(`Tried to capture event ${posthogProps[0]}`);
    },
    posthog,
  };

  // Load the PostHog SDK. Note that PostHog uses localStorage internally
  // and may therefore fail in restrictive situations like embeds in Brave
  // (where accessing window.localStorage throws an exception).
  React.useEffect(() => {
    initPosthog().then(setPosthog).catch(logger.warn);
  }, []);

  // Identify the current user by calling posthog.identify once.
  // Call posthog.reset if there is no user to reset on logout.
  React.useEffect(() => {
    if (posthog && !sessionLoading) {
      if (session && current !== session.name) {
        logger.debug("analytics posthog identify");
        posthog.identify(session.sub, { email: session.email });
        setCurrent(session.name);
      } else if (!session) {
        logger.debug("analytics posthog reset");
        posthog.reset();
        setCurrent(undefined);
      }
    }
  }, [session, sessionLoading, posthog, current]);

  // By default, PostHog will only register a pageview on initial page load.
  // Hook into the Next.js router to track every route change as a pageview.
  React.useEffect(() => {
    const handler = () => posthog?.capture("$pageview");
    Router.events.on("routeChangeComplete", handler);
    return () => Router.events.off("routeChangeComplete", handler);
  }, [posthog]);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {props.children}
    </AnalyticsContext.Provider>
  );
};

const initPosthog = (): Promise<PostHog> => {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

  if (!host) {
    throw new Error("Missing posthog host env var.");
  }

  if (!token) {
    throw new Error("Missing posthog token env var.");
  }

  return new Promise((resolve) => {
    PostHogSDK.init(token, {
      api_host: host,
      loaded: resolve,
      disable_cookie: true,
    });
  });
};

export const useAnalytics = (): AnalyticsContextValue => {
  return React.useContext(AnalyticsContext);
};

export const usePosthog = (): PostHog | undefined => {
  return React.useContext(AnalyticsContext).posthog;
};
