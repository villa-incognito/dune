import {
  ApolloLink,
  FetchResult,
  fromPromise,
  Operation,
  toPromise,
} from "@apollo/client";

type NextLink = (operation: Operation) => Promise<FetchResult>;

type RequestHandler = (
  operation: Operation,
  forward: NextLink
) => Promise<FetchResult>;

// Wrapper for ApolloLink that converts between Observable<T> and Promise<T>
export class PromiseApolloLink extends ApolloLink {
  constructor(request: RequestHandler) {
    super((operation, forward) => {
      return fromPromise(
        request(operation, (operation) => toPromise(forward(operation)))
      );
    });
  }
}
