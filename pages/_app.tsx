import "gui/theme/reach.css";
import "gui/theme/reset.css";
import "gui/theme/theme.css";
import "gui/theme/default.css";
import "gui/theme/prism.css";
import "gui/theme/lib-overrides.css";
import "intersection-observer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "typeface-ibm-plex-mono";
import "typeface-ibm-plex-sans";
import "typeface-ibm-plex-serif";
import "/public/fonts/fonts.css";
import React from "react";
import Router from "next/router";
import { AnalyticsProvider } from "gui/analytics/analytics";
import { ApolloProvider } from "@apollo/client";
import { AppHead } from "gui/head/head";
import { AppProps } from "next/app";
import { CSRFProvider } from "gui/csrf/csrf";
import { ErrorBoundary } from "gui/error/boundary";
import { SessionProvider } from "gui/session/session";
import { ToastNotificationWrapper } from "shared/Toasts/ToastNotificationWrapper";

import { apolloCore } from "lib/apollo/apollo";
import sentryInit from "lib/sentry/init";
import CookieNotification from "gui/CookieNotification/CookieNotification";
import { PromptDialogs } from "shared/PromptDialogs/PromptDialogs";

if (typeof window !== "undefined") {
  sentryInit();
}

export const App = ({ Component, pageProps }: AppProps) => {
  const [loading, setLoading] = React.useState(false);
  const start = () => setLoading(true);
  const ready = () => setLoading(false);

  React.useEffect(() => {
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", ready);
    Router.events.on("routeChangeError", ready);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", ready);
      Router.events.off("routeChangeError", ready);
    };
  }, []);

  // Add a loading class to style page transitions.
  // Add an error boundary to catch thrown exceptions.
  return (
    <div className={loading ? "app-loading" : "app-ready"}>
      <ErrorBoundary>
        <ApolloProvider client={apolloCore}>
          <CSRFProvider>
            <SessionProvider>
              <AppHead />
              <AnalyticsProvider>
                <PromptDialogs />
                <Component {...pageProps} />
                <ToastNotificationWrapper />
                <CookieNotification />
              </AnalyticsProvider>
            </SessionProvider>
          </CSRFProvider>
        </ApolloProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
