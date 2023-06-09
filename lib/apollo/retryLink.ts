import { RetryLink } from "@apollo/client/link/retry";

class NetworkError extends Error {
  constructor(public error: unknown) {
    super();
  }
}

export const retryLink = new RetryLink({
  delay: {
    initial: 1000,
  },
  attempts: {
    max: 5,
    retryIf: (error) => error instanceof NetworkError,
  },
});

export const fetchWithErrors: typeof fetch = async (input, init) => {
  try {
    const response = await fetch(input, init);

    // 429 errors return HTML and are not parseable
    if (response.status === 429) {
      throw new NetworkError(response.status);
    }
    return response;
  } catch (error) {
    throw new NetworkError(error);
  }
};
