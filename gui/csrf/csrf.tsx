import React from "react";
import { httpPost } from "lib/http/http";
import { useErrorBoundary } from "src/hooks/useErrorBoundary";

// SessionContext holds the CSRF token which is required for mutating requests.
// The CSRF token can be sent as a header value or as a hidden form field.
export const CSRFContext = React.createContext<{
  csrf?: string;
}>({});

export const CSRFProvider: React.FC = (props) => {
  const [csrf, setCSRF] = React.useState<string | undefined>();
  const setError = useErrorBoundary();

  React.useEffect(() => {
    httpPost<{ csrf: string }>("/api/auth/csrf")
      .then((res) => setCSRF(res.csrf))
      .catch(setError);
  }, []);
  return (
    <CSRFContext.Provider value={{ csrf }}>
      {props.children}
    </CSRFContext.Provider>
  );
};
