import React from "react";

// Throw an error in the React call stack to trigger componentDidCatch.
export const useErrorBoundary = () => {
  const [, setError] = React.useState();

  return React.useCallback(
    (err) => {
      setError(() => {
        throw err;
      });
    },
    [setError]
  );
};
