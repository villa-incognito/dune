import React from "react";
import styles from "gui/error/boundary.module.css";
import { Center } from "gui/center/center";
import * as Sentry from "@sentry/react";

export class ErrorBoundary extends React.Component<{}, { err?: Error }> {
  componentDidCatch(err: Error) {
    this.setState({ err });
  }

  render() {
    const err = this.state?.err;

    if (err) {
      Sentry.captureException(err);

      return <Center className={styles.boundary}>{err.toString()}</Center>;
    }

    return this.props.children;
  }
}
